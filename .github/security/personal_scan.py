#!/usr/bin/env python3
"""Personal-data scan over the working tree and every blob in the full git history.

Fails (exit 1) on:
  - the owner's legal name, or any run of 3+ consecutive words of it. The name itself is never
    stored here: only sha256 fingerprints (first 16 hex) of the normalised word runs.
  - an e-mail address outside the allowed domains.
Prints only file path, commit (short) and rule: never the matched text.
Run with full history in CI (actions/checkout fetch-depth: 0).
"""
import hashlib
import re
import subprocess
import sys

# sha256(lowercase, single-spaced word run)[:16] for every run of >= 3 consecutive words of the name.
# Public repos keep the fingerprints out of the tree: they come from the Actions secret
# PERSONAL_SCAN_FINGERPRINTS ({"name_runs": [...]}); personal_scan.json then holds only the
# allow-lists. Private repos may ship the fingerprints in personal_scan.json.
# No fingerprints from either = FAIL (the scan is never skipped).
def _load_cfg():
    import json, os
    cfg = {}
    try:
        with open(__file__.replace("personal_scan.py", "personal_scan.json"), encoding="utf-8") as f:
            cfg = json.load(f)
    except FileNotFoundError:
        pass
    env = os.environ.get("PERSONAL_SCAN_FINGERPRINTS", "").strip()
    if env:
        for k, v in json.loads(env).items():
            if isinstance(v, list):
                cfg[k] = sorted(set(cfg.get(k, [])) | set(v))
    if not cfg.get("name_runs"):
        print("FAIL config: no name fingerprints (set the PERSONAL_SCAN_FINGERPRINTS secret or ship personal_scan.json)")
        sys.exit(2)
    return cfg


_CFG = _load_cfg()
NAME_RUN_FINGERPRINTS = set(_CFG["name_runs"])
# Paths where a third-party author address is licence attribution (the name rule still applies there).
EMAIL_ALLOW_PATHS = set(_CFG.get("email_allow_paths", []))
# Old blobs already in history that cannot be rewritten without a force-push to main (not allowed).
# Each one was reviewed; the current tree must still be clean. The name rule still applies to them.
EMAIL_ALLOW_BLOBS = set(_CFG.get("email_allow_blobs", []))
RUN_LENGTHS = (3, 4, 5)
ALLOWED_EMAIL_DOMAINS = ("elghaly.dev", "users.noreply.github.com", "anthropic.com", "example.invalid", "example.com", "example.org")
NOT_A_TLD = {"js", "mjs", "cjs", "ts", "html", "htm", "css", "json", "png", "svg", "txt", "md", "py", "kt", "java", "xml"}
RESERVED_TLDS = {"test", "example", "invalid", "localhost", "local", "tld"}
EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})")
WORD = re.compile(r"[^\W\d_]+", re.UNICODE)
SKIP_PATHS = re.compile(r"(^|/)(node_modules|\.git|dist|build)/|\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip|gz|wasm|bin|mp3|mp4|ogg|jar|keystore|aab|apk)$", re.I)


def fp(words):
    return hashlib.sha256(" ".join(words).encode("utf-8")).hexdigest()[:16]


def scan_text(text, path="", blob=""):
    rules = set()
    words = [w.lower() for w in WORD.findall(text)]
    for n in RUN_LENGTHS:
        for i in range(len(words) - n + 1):
            if fp(words[i:i + n]) in NAME_RUN_FINGERPRINTS:
                rules.add("legal-name")
                break
    for m in ([] if path in EMAIL_ALLOW_PATHS or blob in EMAIL_ALLOW_BLOBS else EMAIL.finditer(text)):
        dom = m.group(1).lower()
        tld = dom.rsplit(".", 1)[-1]
        if tld in NOT_A_TLD or tld in RESERVED_TLDS:
            continue  # "fn@file.js" stack frames and RFC 2606 / 6761 test names are not addresses
        if not any(dom == d or dom.endswith("." + d) for d in ALLOWED_EMAIL_DOMAINS):
            rules.add("email-outside-allowlist")
    return rules


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, check=True).stdout


def main():
    hits = []
    seen = set()
    revs = git("rev-list", "--all").decode().split()
    for rev in revs:
        for line in git("ls-tree", "-r", rev).decode("utf-8", "replace").splitlines():
            meta, path = line.split("\t", 1)
            _, kind, sha = meta.split()
            if kind != "blob" or sha in seen or SKIP_PATHS.search(path):
                continue
            seen.add(sha)
            data = git("cat-file", "blob", sha)
            if b"\0" in data[:8000]:
                continue
            for r in scan_text(data.decode("utf-8", "replace"), path, sha):
                hits.append((r, path, rev[:8]))
    tracked = git("ls-files").decode("utf-8", "replace").splitlines()
    for path in tracked:
        if SKIP_PATHS.search(path):
            continue
        try:
            data = open(path, "rb").read()
        except OSError:
            continue
        if b"\0" in data[:8000]:
            continue
        for r in scan_text(data.decode("utf-8", "replace"), path):
            hits.append((r, path, "worktree"))
    print(f"personal-data scan: {len(revs)} commits, {len(seen)} blobs, {len(tracked)} tracked files")
    if hits:
        for r, path, where in sorted(set(hits)):
            print(f"FAIL {r}: {path} @ {where}")
        return 1
    print("PASS: no legal name and no e-mail outside the allowed domains, in the tree or the history")
    return 0


if __name__ == "__main__":
    sys.exit(main())
