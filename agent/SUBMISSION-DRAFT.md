# Open Agentic Web Challenge: Thoth submission (DRAFT, do not submit)

Prepared 18 Nov 2026. **Not submitted.** The owner reviews, registers and submits.

## The program
| Item | What I found | Status |
|---|---|---|
| Name | Open Agentic Web Challenge (Cognizant AI Lab with Mozilla, MIT Media Lab NANDA, AWS), on Devpost | VERIFIED (press release and repo) |
| Deadline | **11 January 2027, 8:00 am PT (16:00 UTC)** | Rules page, read by Instinct 19 Nov 2026 |
| Who can enter | Above the age of majority where you live; all countries and territories except "standard exceptions" | From the Devpost page via search. **Egypt not confirmed**: check that Egypt is not in the exceptions list |
| What to build | A public website with: a public `.json` agent network, a browser runtime for it, a chat interface, and settings where the visitor picks the LLM and key. Must follow the MVP spec. | VERIFIED (challenge repo README) |
| Tracks | 1: agentify existing websites. 2: build components for the agentic web. Thoth fits track 1. | VERIFIED (worldwideagenticweb.org via search) |
| Submission items | Public site URL, the public `.json` network file, the runtime, and a video of it running in a browser | Video: **under 2 minutes**, must show the project running in a web browser, **public on YouTube**. VERIFIED, rules section 4 (19 Nov) |
| Existing project | Allowed if "significantly updated after the start of the Hackathon Submission Period", and entrants "should explain how". | VERIFIED, rules section 4. See `SIGNIFICANT-UPDATE.md` |
| IP | Submissions stay the entrant's property. Sponsor gets a non-exclusive license for judging and "the right to promote the Submission" for the Hackathon Period and three years after. | VERIFIED, rules section 7 |
| Judging | Technical implementation and quality of the idea | From the Devpost page via search; confirm the full list |
| Prizes | $13,000 pool, announced at Davos | From press coverage |
| Cost | Free. Otari credits for the first 100 registrants | VERIFIED (repo README) |

The video limit, the existing-project rule and the IP terms were read on the rules page on 19 Nov 2026 (quotes in `VIDEO-SCRIPT.md` and `SIGNIFICANT-UPDATE.md`). **Still open:** the eligibility exceptions list (excluded countries) and whether Egypt is affected. That check is with Instinct (official OFAC programs page); UNKNOWN until it comes back.

## Why Thoth fits
Track 1 asks to agentify an existing website so that any agent, and any visitor with their own key, can use it. Thoth already runs on the visitor's own key and stores nothing. The agentic version keeps Thoth's integrity charter in every agent.

## Draft text for the Devpost form

**Project name:** Ask Thoth: an open agentic helper for exporters

**Tagline (one line):** A free, honest agent network that helps exporters pitch, translate and learn export basics, running in any browser on the visitor's own AI key.

**What it does**
Thoth is a free helper for exporters, small or large, who want to reach buyers abroad. Ask Thoth puts it on the open agentic web. A front-desk agent answers questions about Thoth from the site's own published facts. It hands work to three specialists: a pitch writer that uses only the facts the exporter gives, a trade translator that adds nothing and reads back price, currency, units and Incoterm, and an export-basics explainer. Every agent follows Thoth's integrity charter: no invented certifications, HS codes and duty rates only as "candidates, verify", no promises of sales or clearance, scam warnings, and "check with a licensed customs broker". It runs in the visitor's browser on the provider and key they choose. Thoth pays for no LLM calls and stores nothing.

**How we built it**
Thoth's static site gained an `agent/` page that follows the Worldwide Agentic Web MVP spec, using the challenge's browser runtime unchanged. The network is a public `.hocon` built into `thoth_assistant.network.json`, with one read-only website action (`get_thoth_guide`) that serves the same facts the page shows. The charter lives in shared instructions, copied from Thoth's existing server prompts, so the agent and the full app follow the same rules.

**What other agents can do with it**
Any agentic website can call `https://thoth.elghaly.dev/agent/thoth_assistant` to get honest export help for its own visitors, on that visitor's key, after the visitor agrees.

**Challenges**
Keeping a language model honest about trade facts. The answer was to put the charter in every agent and to give agents no tools that could act on anyone's behalf.

**What's next**
Voice in the agentic page, more languages, and linking to other agentic trade sites as partners.

**Built with:** HTML, JavaScript, JSON/HOCON, the Open Agentic Web browser runtime, hosted Otari (default router), GitHub Pages.

## Video script
Moved to `VIDEO-SCRIPT.md` (1:45 target, under the 2-minute limit).

## What is still missing before submitting
| # | Missing item | Who | Blocking? |
|---|---|---|---|
| 1 | **Run the build** (`build_network.mjs`) to produce `thoth_assistant.network.json`, `bridge/` and the discovery files, and fix what it reports | Owner, on a local machine (commands in `agent/README.md`) | YES |
| 2 | **The full app link `/use/` does not exist on main.** It is only in thoth PR 6, which was reviewed as not merge-ready. Either fix and merge PR 6, or change the two links in `thoth-page.js` and `index.html` to the home page | Owner decision | YES (broken link) |
| 3 | Merge this Draft PR so GitHub Pages serves `thoth.elghaly.dev/agent/` | Owner says "merge" | YES |
| 4 | Live test with a real key (all five sample queries; the last must be declined) | Owner | YES |
| 5 | Record the video (`VIDEO-SCRIPT.md`) and upload it to YouTube as **Public** | Owner | YES |
| 5b | Confirm the first sentence of the "How was it updated?" answer in `SIGNIFICANT-UPDATE.md` | Owner | YES |
| 6 | Register on Devpost and confirm eligibility (Egypt) and the rules | Owner | YES |
| 7 | Test Gemini through its OpenAI-compatible endpoint, if you want Gemini as an option (UNSURE whether it allows browser calls) | Optional | No |
| 8 | Add the site to the challenge's Agentic Websites list (pull request to their repo) | Optional, after hosting | No |
