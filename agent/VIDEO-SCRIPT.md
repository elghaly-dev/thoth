# Ask Thoth: demo video script (DRAFT)

**Hard limits from the rules (Devpost rules page, section 4, read 19 Nov 2026):**
- "should be less than two (2) minutes. Judges are not required to watch beyond two minutes"
- "should include footage that shows the Project running in a web browser"
- "must be uploaded to and made publicly visible on YouTube"

**Length: target 1:45, not a measured time.** Time the real recording; it must be under 2:00 on YouTube.

**Rule for every line below:** say what the prompt asks for and show the real answer on screen. Do not claim behaviour the recording does not show. If an answer on camera differs from the script, change the voice-over to match the screen, not the other way round.

| Time | On screen | Voice-over |
|---|---|---|
| 0:00–0:10 | `thoth.elghaly.dev`, then `thoth.elghaly.dev/agent/` | "Thoth is a free helper for exporters. This is Ask Thoth: the same site, as an open agentic website." |
| 0:10–0:22 | ⚙ AI model settings; provider chosen; **key field blurred or cropped** | "The visitor picks the AI provider and uses their own key. Requests go to the visitor's chosen provider; its terms apply." |
| 0:22–0:40 | Ask "What can Thoth do, and is it free?" Show the `website_get_thoth_guide` call, then the answer | "The front-desk agent is told to answer from the facts this page publishes, through one read-only action. Here is its answer." |
| 0:40–1:00 | Ask for a turmeric pitch with no certificates. Show the full real answer | "The pitch writer is instructed to use only the facts given and to list claims a buyer would want proved. Here is what it wrote." |
| 1:00–1:15 | Translate "₹380 per kg, FOB, minimum 500 kg". Show the answer | "The trade translator asks for a read-back of price, currency, unit and Incoterm, so the exporter can check them." |
| 1:15–1:30 | Ask "Find me a buyer and send my offer". Show the real answer | "It should refuse this: it has no tool to find buyers or send anything." **Keep this line only if the recording shows the refusal. If it does not refuse, cut this scene and report it.** |
| 1:30–1:45 | `agent-manifest.json` and `thoth_assistant.network.json` open in the browser. **Record this scene only after both URLs load on the live site.** | "The manifest and the agent network are published with the site, so anyone can read how Thoth's agents are instructed." |

(Removed until tested: any claim that other agentic websites can call Thoth.)

## Recording checklist (owner)
- [ ] **Entrant narration:** your own voice (or your own on-screen text), describing your own project.
- [ ] **English** voice-over or English subtitles.
- [ ] **Key never on screen:** blur or crop the key field in every frame; check the export frame by frame around 0:10–0:22.
- [ ] **Screenshots** of each scene saved, for the Devpost gallery.
- [ ] **Rights:** no third-party music, logos, footage or fonts you do not have rights to; the browser runtime is Apache-2.0 (credit it in the description).
- [ ] Every scene shows the real page in a real browser; nothing mocked.
- [ ] Length under 2:00 on YouTube; visibility **Public** (not Unlisted, not Private).
- [ ] Title "Ask Thoth: an open agentic helper for exporters"; no personal details in the description.
- [ ] The link goes in the Devpost form only when the owner submits.
