#!/usr/bin/env node
// Ask Thoth checks (PR #8, item 6). No network, no build script needed.
// - agent/thoth_assistant.network.json is in step with its source,
//   agent/thoth_assistant.hocon: same description, sample queries, model,
//   replacement strings and agent names (the JSON is rebuilt with the
//   challenge's build_network.mjs; see agent/README.md).
// - No "free" wording in the submission draft, the video script, the
//   hocon or the built network file.
// Run: node tools/check-agent-network.mjs
import fs from 'node:fs';

let checks = 0;
const fails = [];
const check = (ok, msg) => { checks++; if (!ok) fails.push(msg); };
const read = (p) => fs.readFileSync(p, 'utf8');

const hocon = read('agent/thoth_assistant.hocon');
const net = JSON.parse(read('agent/thoth_assistant.network.json'));

// Triple-quoted HOCON strings, normalised the way the runtime parser keeps them.
const hoconString = (key) => {
  const triple = new RegExp(`"${key}"\\s*:\\s*"""([\\s\\S]*?)"""`).exec(hocon);
  if (triple) return triple[1];
  const plain = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(hocon);
  return plain ? JSON.parse(`"${plain[1]}"`) : undefined;
};

check(net.metadata.description === hoconString('description'), 'network.json description matches the hocon');
for (const q of net.metadata.sample_queries) check(hocon.includes(JSON.stringify(q)), `sample query is in the hocon: ${q}`);
check(net.llm_config.model_name === hoconString('model_name'), 'model_name matches the hocon');
for (const [k, v] of Object.entries(net.commondefs.replacement_strings)) {
  const src = hoconString(k);
  check(src !== undefined && src === v, `replacement string ${k} matches the hocon`);
}
for (const k of [...hocon.matchAll(/"(\w+)"\s*:\s*"""/g)].map((m) => m[1]).filter((k) => /_rules$/.test(k))) {
  check(k in net.commondefs.replacement_strings, `hocon ${k} is in the built network`);
}
for (const t of net.tools) check(new RegExp(`"name"\\s*:\\s*"${t.name}"`).test(hocon), `agent ${t.name} is defined in the hocon`);

const FREE = /\bfree\b|free-|مجان|免费|मुफ़्त|मुफ्त|निःशुल्क/i;
for (const p of ['agent/SUBMISSION-DRAFT.md', 'agent/VIDEO-SCRIPT.md', 'agent/thoth_assistant.hocon', 'agent/thoth_assistant.network.json']) {
  read(p).split('\n').forEach((line, i) => check(!FREE.test(line), `${p}:${i + 1} has no "free" wording`));
}

if (fails.length) { console.log(`agent-network: FAIL ${fails.length}/${checks}`); fails.forEach((m) => console.log('  FAIL | ' + m)); process.exit(1); }
console.log(`agent-network: PASS ${checks}/${checks}`);
