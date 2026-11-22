#!/usr/bin/env python3
"""Self-test: the scanners must catch what they are meant to catch. Uses made-up words only."""
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
fails = []


def check(ok, msg):
    print(("ok   " if ok else "FAIL ") + msg)
    if not ok:
        fails.append(msg)


# personal_scan: a planted made-up name run and a personal address are caught; allowed ones pass.
fake = ["quill", "marrow", "tessaly"]
os.environ["PERSONAL_SCAN_FINGERPRINTS"] = json.dumps({"name_runs": [hashlib.sha256(" ".join(fake).encode()).hexdigest()[:16]], "email_allow_paths": ["vendor/lib.js"]})
sys.path.insert(0, str(HERE))
import personal_scan as ps  # noqa: E402

check("legal-name" in ps.scan_text("by Quill  MARROW, Tessaly."), "name run caught across case and spacing")
check("legal-name" not in ps.scan_text("quill marrow and tessaly"), "words that are not a consecutive run pass")
addr = "someone" + "@" + "mailhost.net"
check("email-outside-allowlist" in ps.scan_text("write to " + addr), "address outside the allowed domains caught")
check(not ps.scan_text("write to support" + "@" + "elghaly.dev"), "company address passes")
check(not ps.scan_text("at render" + "@" + "app.js:12 and user" + "@" + "host.test"), "stack frames and reserved test names pass")
check(not ps.scan_text("author " + addr, "vendor/lib.js"), "allow-listed path skips the e-mail rule only")
check("legal-name" in ps.scan_text("quill marrow tessaly", "vendor/lib.js"), "allow-listed path still gets the name rule")

# check_workflows: a floating tag, pull_request_target, a write permission on PRs and a soft-fail are caught.
with tempfile.TemporaryDirectory() as d:
    wf = pathlib.Path(d, ".github", "workflows")
    wf.mkdir(parents=True)
    wf.joinpath("bad.yml").write_text(
        "on:\n  pull_request_target:\n  pull_request:\npermissions:\n  contents: write\njobs:\n  a:\n    runs-on: x\n"
        "    steps:\n      - uses: actions/checkout@v4\n      - run: make || true\n      - run: echo ${{ secrets.DEPLOY_KEY }}\n")
    out = subprocess.run([sys.executable, str(HERE / "check_workflows.py")], cwd=d, capture_output=True, text=True)
    check(out.returncode == 1, "bad workflow fails the check")
    for rule in ("not pinned to a full commit SHA", "pull_request_target", "write permission", "may never pass", "secret DEPLOY_KEY"):
        check(rule in out.stdout, f"bad workflow: '{rule}' reported")
    wf.joinpath("bad.yml").write_text(
        "on:\n  pull_request:\npermissions:\n  contents: read\njobs:\n  a:\n    runs-on: x\n"
        "    steps:\n      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4\n")
    out = subprocess.run([sys.executable, str(HERE / "check_workflows.py")], cwd=d, capture_output=True, text=True)
    check(out.returncode == 0, "pinned, read-only workflow passes")

if fails:
    print(f"FAIL {len(fails)} scanner self-test(s)")
    sys.exit(1)
print("PASS: scanner self-tests")
