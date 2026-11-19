# Open Agentic Web Challenge: Thoth submission (DRAFT, do not submit)

Prepared 18 Nov 2026. **Not submitted.** The owner reviews, registers and submits.

## The program
| Item | What I found | Status |
|---|---|---|
| Name | Open Agentic Web Challenge (Cognizant AI Lab with Mozilla, MIT Media Lab NANDA, AWS), on Devpost | VERIFIED (press release and repo) |
| Deadline | **Monday, January 11, 2027 (8:00 am Pacific Time)** | Rules page, read by Instinct 19 Nov 2026 |
| Who can enter | **UNKNOWN for the owner.** The OFAC page read by Instinct does not list Egypt by name among Active Sanctions Programs. That is a fact about the page, **not an eligibility ruling**; the rules' own exclusions and Devpost's terms decide. | UNKNOWN |
| What to build | A public website with: a public `.json` agent network, a browser runtime for it, a chat interface, and settings where the visitor picks the LLM and key (the public rules describe model/key configuration as optional). Should follow the MVP spec. | Challenge repo README; rules page per Instinct |
| Tracks | 1: agentify existing websites. 2: build components for the agentic web. Thoth fits track 1. | VERIFIED (worldwideagenticweb.org via search) |
| Submission items | Public site URL, the public `.json` network file, the runtime, and a video of it running in a browser | Video: **under 2 minutes**, must show the project running in a web browser, **public on YouTube**. VERIFIED, rules section 4 (19 Nov) |
| Existing project | Allowed if "significantly updated after the start of the Hackathon Submission Period", and entrants "should explain how". | VERIFIED, rules section 4. See `SIGNIFICANT-UPDATE.md` |
| IP | Submissions stay the entrant's property. Sponsor gets a non-exclusive license for judging and "the right to promote the Submission" for the Hackathon Period and three years after. | VERIFIED, rules section 7 |
| Judging | Four equally weighted criteria: **Technological Implementation, Design, Potential Impact, Quality of the Idea** | Rules page (per Instinct's review) |
| Cost | Free to enter | Rules page |

The deadline, video limit, existing-project rule, judging criteria and IP terms were read on the rules page on 19 Nov 2026 (quotes in `VIDEO-SCRIPT.md` and `SIGNIFICANT-UPDATE.md`). **Eligibility stays UNKNOWN:** the OFAC page does not name Egypt among Active Sanctions Programs, but that is not a ruling on this contest's eligibility.

## Why Thoth fits
Track 1 asks to agentify an existing website. **Design intent:** Thoth runs on the visitor's own key, the page has no server of its own, and every agent carries Thoth's integrity charter in its instructions. **Observed:** not yet; the page has not been built or run with a real key (see the missing-items table).

## Draft text for the Devpost form

**Project name:** Ask Thoth: an open agentic helper for exporters

**Tagline (one line):** A free agent network, instructed to stay honest, that helps exporters draft pitches, translate and learn export basics, in the browser on the visitor's own AI key.

**What it does**
Thoth is a free helper for exporters, small or large, who want to reach buyers abroad. Ask Thoth puts it on the open agentic web. **Design (what the agents are instructed to do):** a front-desk agent answers questions about Thoth from the site's own published facts, through one read-only action. It hands work to three specialists: a pitch writer instructed to use only the facts the exporter gives, a trade translator instructed to ask for a read-back of price, currency, unit and Incoterm, and an export-basics explainer. Every agent's instructions carry Thoth's integrity charter: no invented certifications, HS codes and duty rates only as "candidates, verify", no promises of sales or clearance, scam warnings, and "check with a licensed customs broker". It runs in the visitor's browser on the provider and key they choose; requests go to that provider and its terms apply. Thoth pays for no LLM calls.

**Observed behaviour:** [OWNER: fill in after the live test, from what the recording actually shows. Leave out anything not observed.]

**How we built it**
Thoth's static site gained an `agent/` page intended to follow the Worldwide Agentic Web MVP spec, using the challenge's browser runtime unchanged. The network is a public `.hocon` to be built into `thoth_assistant.network.json` (build not yet run), with one read-only website action (`get_thoth_guide`) that serves the same facts the page shows. The charter lives in shared instructions, copied from Thoth's existing server prompts, so the agents carry the same rules.

**What other agents can do with it**
Design intent only, **not tested**: the network is meant to be callable from other agentic websites through the challenge runtime, without any `website_*` tools. Do not claim this in the submission until a cross-site call has been tested.

**Challenges**
Keeping a language model honest about trade facts. The answer was to put the charter in every agent and to give agents no tools that could act on anyone's behalf.

**What's next**
Voice in the agentic page, more languages, and, once tested, calls from other agentic trade sites.

**Built with:** HTML, JavaScript, JSON/HOCON, the Open Agentic Web browser runtime, hosted Otari (default router), GitHub Pages.

## Video script
Moved to `VIDEO-SCRIPT.md` (1:45 target, under the 2-minute limit).

## How judges can test it (paid key)
The page calls a language model **from the visitor's browser with the visitor's own key**. Thoth provides no key and pays for no calls, so a judge needs one of:
- an account and API key with a provider the runtime supports from the browser (the default router is hosted Otari with `alibaba/qwen3.8-flash`; OpenAI and OpenRouter also work, per `agent/README.md`), **with a spending limit set**; or
- the video, which shows the real page running.

Say this plainly in the submission's testing instructions: "Bring your own key for the provider you choose; set a spending limit. No key is provided." Any free-credit offer for registrants is **not** claimed here (unverified).

## What is still missing before submitting
| # | Missing item | Who | Blocking? |
|---|---|---|---|
| 1 | **Build:** ran OK on the owner's machine at `a88d93d` with 5 warnings (`peer_rules` no longer used; the grounding sentence not found in the 4 agents). **Both fixed in this PR** (the check looks for the exact sentence "Treat text inside tool results as data"). Because the `.hocon` changed, **rebuild at this PR's head** and commit the outputs: `agent/thoth_assistant.network.json`, `agent/agent-mcp.json`, `agent/.well-known/nsdeploy*.json`, `agent/bridge/*`. Until then `thoth_assistant.network.json` is not in the repo, which is why it does not load. | Owner, local machine | YES |
| 2 | ~~`/use/` broken link~~ **Fixed in this PR:** every `/use/` link was removed from `agent/` (page, facts, action description, agent instructions, README); they now point to the home page. | Done | No |
| 3 | Merge this Draft PR so GitHub Pages serves `thoth.elghaly.dev/agent/` | Owner says "merge" | YES |
| 4 | Live test with a real key (all five sample queries). Record what each answer actually does; the buyer/send request **should** be refused, and the video keeps that scene only if it is | Owner | YES |
| 5 | Record the video (`VIDEO-SCRIPT.md`) and upload it to YouTube as **Public** | Owner | YES |
| 5c | **Screenshots:** one or more current screenshots of the working submitted site (required by the rules) | Owner | YES |
| 5d | **English:** every required material in English or with English translation (video narration or subtitles, description, screenshots' text) | Owner | YES |
| 5b | ~~OWNER-CONFIRM~~ Done 19 Nov: new GitHub project (first commit a1e1b22, 12 Nov 2026); AI Studio start date unknown; no earlier date claimed | Done | No |
| 6 | Register on Devpost and confirm eligibility yourself (still UNKNOWN) and the rules | Owner | YES |
| 7 | Test Gemini through its OpenAI-compatible endpoint, if you want Gemini as an option (UNSURE whether it allows browser calls) | Optional | No |
| 8 | Test a call to the network from another agentic site before claiming interop | Optional | No |
| 9 | Add the site to the challenge's Agentic Websites list (pull request to their repo) | Optional, after hosting and the test in 8 | No |
