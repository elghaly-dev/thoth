# Ask Thoth: open agentic website (draft)

This folder makes Thoth an **open agentic website**, following the
[Worldwide Agentic Web MVP spec](https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md),
for the Open Agentic Web Challenge (track 1: agentify an existing website).

**Status: Draft. Not submitted. Not built yet (see "One step left").**

## What is here
| File | What it is |
|---|---|
| `index.html` | The page: Thoth's facts plus the assistant |
| `thoth-page.js` | Thoth's public facts, copied from the rules in `app/server.ts`. The page renders them and the assistant reads them. |
| `site-actions.js` | One read-only action, `get_thoth_guide`. Nothing on this page can change, order or send anything. |
| `thoth_assistant.hocon` | The agent network: `thoth_front_desk` plus three specialists (`pitch_writer`, `trade_translator`, `export_basics`), all bound by Thoth's integrity charter |
| `agent-manifest.json`, `links.json` | Public description of the network |
| `site.js`, `assistant.css` | Mounts the assistant (from the challenge's template) |
| `runtime/` | The browser runtime, Apache-2.0, from cognizant-ai-labs/agentic-web at commit `63a956c`. Thoth changes: `byok.js` never persists the visitor's key (tab sessionStorage only); provider-key messages say "Model settings" |

## One step left (run it on your own machine)
The build script turns the `.hocon` into `thoth_assistant.network.json`, validates it, and writes the `bridge/` folder and discovery files. It was **not run** in the session that prepared this draft, because running the challenge's downloaded scripts was blocked there.

```bash
git clone https://github.com/cognizant-ai-labs/agentic-web /tmp/agentic-web
```

```bash
node /tmp/agentic-web/skills/agentify-website/scripts/build_network.mjs agent/thoth_assistant.hocon --manifest agent/agent-manifest.json
```

Fix every error it prints. Then serve and try it:

```bash
node /tmp/agentic-web/skills/agentify-website/scripts/serve_site.mjs agent --port 8080
```

Open http://127.0.0.1:8080/, open **⚙ AI model settings**, add a key **with a spending limit**, and try the five sample queries. The last one ("Find me a buyer…") must be declined.

## LLM provider
The default router is hosted Otari (the challenge's partner; registrants get free credits) with `alibaba/qwen3.8-flash`. OpenAI and OpenRouter also work from the browser. Using Gemini through its OpenAI-compatible endpoint is **UNSURE**: test that it allows browser calls (CORS) and tool calls before relying on it.

## Limits
- Static page. The network file and its instructions are public.
- The assistant only explains and drafts. It cannot find buyers, send anything, confirm HS codes or duties, or verify anyone.
- Other agent sites can call this network; they get no `website_*` tools and are pointed to the full Thoth app.
- The visitor's messages go to the provider they choose.
