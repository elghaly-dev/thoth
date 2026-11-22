#!/usr/bin/env python3
"""CI supply-chain check for .github/workflows/*.yml (stdlib only). Fails on:
  - a `uses:` that is not pinned to a full 40-hex commit SHA (local ./ actions are allowed)
  - a workflow without a top-level `permissions:` block
  - `pull_request_target` anywhere
  - a write permission in a workflow that runs on pull_request
  - any secret other than PR_SECRETS_OK in a workflow that runs on pull_request
  - `continue-on-error`, `|| true`, `set +e` (a failing step may never pass)
Prints the file, line and rule only.
"""
import pathlib
import re
import sys

wf_dir = pathlib.Path(".github/workflows")
# Not credentials: GITHUB_TOKEN (read-only here) and the name fingerprints for the personal-data scan.
PR_SECRETS_OK = {"GITHUB_TOKEN", "PERSONAL_SCAN_FINGERPRINTS"}
bad = []
files = sorted(list(wf_dir.glob("*.yml")) + list(wf_dir.glob("*.yaml")))
for f in files:
    text = f.read_text(encoding="utf-8")
    lines = text.splitlines()
    on_pr = re.search(r"(?m)^\s*(-\s*)?pull_request\s*:|^on:\s*\[?[^\n]*\bpull_request\b", text) is not None
    if not re.search(r"(?m)^permissions:", text):
        bad.append((f, 0, "no top-level permissions block"))
    for i, line in enumerate(lines, 1):
        s = line.split("#", 1)[0]
        m = re.search(r"\buses:\s*([^\s]+)", s)
        if m:
            ref = m.group(1).strip("'\"")
            if not (ref.startswith("./") or re.fullmatch(r"[\w.-]+/[\w./-]+@[0-9a-f]{40}", ref) or re.fullmatch(r"docker://[^@]+@sha256:[0-9a-f]{64}", ref)):
                bad.append((f, i, f"action not pinned to a full commit SHA: {ref.split('@')[0]}"))
        if "pull_request_target" in s:
            bad.append((f, i, "pull_request_target is not allowed"))
        if re.search(r"continue-on-error|\|\|\s*true\b|set\s+\+e\b", s):
            bad.append((f, i, "a failing step may never pass"))
        if on_pr and re.search(r":\s*write\b", s) and re.search(r"^\s*(contents|pages|id-token|issues|pull-requests|packages|actions|deployments|statuses|checks|security-events)\s*:", s):
            bad.append((f, i, "write permission in a workflow that runs on pull_request"))
        if on_pr:
            for sm in re.finditer(r"secrets\.([A-Za-z_][A-Za-z0-9_]*)", s):
                if sm.group(1) not in PR_SECRETS_OK:
                    bad.append((f, i, f"secret {sm.group(1)} used in a workflow that runs on pull_request"))
print(f"workflow check: {len(files)} file(s)")
for f, i, r in bad:
    print(f"FAIL {f}:{i} {r}")
if bad:
    sys.exit(1)
print("PASS: every action pinned to a commit SHA, least permissions, no pull_request_target, no secrets on PR runs")
