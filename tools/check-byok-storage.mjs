// Checks that the agent runtime never writes a visitor's provider key to
// persistent storage (localStorage or cookie): the key lives only in this
// tab's sessionStorage. Also checks that a key left by an older version is
// purged on read. Run: node tools/check-byok-storage.mjs
function mem() {
  const m = new Map();
  return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => void m.set(k, String(v)), removeItem: (k) => void m.delete(k) };
}
globalThis.localStorage = mem();
globalThis.sessionStorage = mem();
globalThis.location = { hostname: "thoth.elghaly.dev", origin: "https://thoth.elghaly.dev", protocol: "https:" };
let cookie = "";
globalThis.document = { get cookie() { return cookie; }, set cookie(v) { cookie = v; } };

const byok = await import("../agent/runtime/byok.js");
const KEY = "test-visitor-key-not-real-0001";
let checks = 0;
const fails = [];
const check = (ok, msg) => { checks++; if (!ok) fails.push(msg); };
const persisted = () => [...localStorage.m.values()].join("\n") + "\n" + cookie;

const { profile } = byok.upsertByokProfile({ name: "Gemini", key: KEY, model: "m", router: "https://generativelanguage.googleapis.com/v1beta/openai" });
check(profile && profile.key === KEY, "upsert returns the key in memory for this tab");
check(!persisted().includes(KEY), "key is not written to localStorage or cookie");
byok.saveTabByokSetup(profile);
check(sessionStorage.m.get("nsweb-byok-tab-key") === KEY, "key kept in this tab's sessionStorage");
check(byok.loadTabByokSetup().key === KEY, "tab setup still reads the key");
check(!persisted().includes(KEY), "still nothing persisted after applying the setup");
check(byok.loadByokStore().profiles.length === 1 && byok.loadByokStore().profiles[0].key === "", "saved profile keeps router/model, no key");

// Legacy: a key stored by an older version is purged on read.
localStorage.m.set("nsweb-byok-profiles-v1", JSON.stringify({ version: 1, selectedId: "a", updatedAt: "z", profiles: [{ id: "a", key: KEY, model: "m", router: "https://x" }] }));
const loaded = byok.loadByokStore();
check(loaded.profiles[0].key === "", "legacy stored key is not returned");
check(!localStorage.m.get("nsweb-byok-profiles-v1").includes(KEY), "legacy stored key is purged from localStorage");

if (fails.length) {
  console.log(`check-byok-storage: FAIL ${fails.length}/${checks}`);
  for (const f of fails) console.log("  FAIL | " + f);
  process.exit(1);
}
console.log(`check-byok-storage: PASS ${checks}/${checks}`);
