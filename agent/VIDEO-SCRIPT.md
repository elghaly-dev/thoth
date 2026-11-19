# Ask Thoth: demo video script (DRAFT)

**Hard limits from the rules (Devpost rules page, section 4, read 19 Nov 2026):**
- "should be less than two (2) minutes. Judges are not required to watch beyond two minutes"
- "should include footage that shows the Project running in a web browser"
- "must be uploaded to and made publicly visible on YouTube"

**Target length: 1:45.** That leaves 15 seconds of margin. Record the screen in one browser tab and speak over it. Every shot below is the real page running in the browser; nothing is mocked.

**Before recording:**
- Run the build (agent/README.md, "One step left") and the five sample queries. The video cannot be recorded until the page runs.
- Use a key **with a spending limit**. Blur or crop the key field: it must never appear on screen.
- Use no third-party music, logos or footage (the rules cover third-party material).
- The `/use/` link: do not click it on camera until it works (see SUBMISSION-DRAFT.md, item 2).

| Time | On screen | Voice-over (about 230 words in total) |
|---|---|---|
| 0:00–0:10 | `thoth.elghaly.dev`, then `thoth.elghaly.dev/agent/` | "Thoth is a free helper for exporters. This is Ask Thoth: the same site, now an open agentic website." |
| 0:10–0:22 | ⚙ AI model settings; the provider is chosen, the key field is blurred | "The visitor brings their own AI provider and key. Thoth pays for no model calls and stores nothing." |
| 0:22–0:40 | Ask "What can Thoth do, and is it free?" Show the `website_get_thoth_guide` call, then the answer | "The front-desk agent answers only from the facts this page publishes, through one read-only action." |
| 0:40–1:00 | Ask for a turmeric pitch with no certificates. Show the claims-to-verify list and the scam warning | "The pitch writer uses only what the exporter gives. It invents no certificates and lists every claim the buyer will want proved." |
| 1:00–1:15 | Translate "₹380 per kg, FOB, minimum 500 kg". Show the read-back | "The trade translator adds nothing, and reads back price, currency, unit and Incoterm, so nothing changes in translation." |
| 1:15–1:30 | Ask "Find me a buyer and send my offer". Show the refusal | "And it refuses what it must not do. It cannot find buyers or send anything on anyone's behalf." |
| 1:30–1:45 | `agent-manifest.json` and the network file in the browser | "The network is public. Any agentic website can call Thoth for its own visitors, on their key, after they agree. Thoth: honest help, open to every agent." |

**Upload checklist:** YouTube visibility = Public (not Unlisted, not Private); length under 2:00 shown by YouTube; title "Ask Thoth: an open agentic helper for exporters"; no personal details in the description; the link goes in the Devpost form only when the owner submits.
