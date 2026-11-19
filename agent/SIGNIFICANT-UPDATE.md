# What changed during the Submission Period (DRAFT)

**The rule (Devpost rules page, section 4, "New & Existing", read 19 Nov 2026):** a project that "existed prior to the Hackathon Submission Period, must have been significantly updated after the start of the Hackathon Submission Period." And: "Entrants should explain how their Project was significantly updated during the Submission Period."

**Submission Period start:** 11 Nov 2026 (from the earlier rules check; recheck on the rules page before submitting).

## The facts, from this repository's git history
| Date | Commit | What |
|---|---|---|
| 12 Nov 2026 | `a1e1b22` | First commit of this repository: README, landing page, custom domain |
| 13–14 Nov 2026 | `4daf940`…`a98ecff` | Meta tags, wording, AI Studio app export under `app/` |
| 19 Nov 2026 | `7b5c6cc` (PR 7) | **The `agent/` open agentic website:** agent network (front desk + three specialists), integrity charter in every agent, one read-only site action, public manifest, browser runtime |

Every commit is on or after 12 Nov 2026. If Thoth existed in any form before 11 Nov (for example the AI Studio app), the `agent/` layer added on 19 Nov is the significant update.

## Draft text for the Devpost form ("How was it updated?")
> Before the challenge, Thoth was a single chat app for exporters. During the Submission Period we made it an open agentic website. We added a public agent network that follows the Worldwide Agentic Web MVP spec: a front-desk agent and three specialists (pitch writer, trade translator, export-basics explainer), each bound by Thoth's integrity charter. We added one read-only site action that serves the page's own facts, a public manifest so other agentic sites can call Thoth, and a settings panel so each visitor uses their own AI provider and key. None of this existed before 11 November 2026.

**Owner check:** the first sentence ("Before the challenge, Thoth was a single chat app") must be true. If Thoth did not exist before 11 Nov, replace the whole answer with "New project, started 12 November 2026."
