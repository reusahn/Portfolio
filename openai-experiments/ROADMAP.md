# Creative Experiments Production Roadmap
**Last updated:** November 3, 2026 · **Target:** OpenAI Creative, Experiments application proof.
**Daily intent:** a **five-hour focus block** is a planning budget, not a claim that an autonomous assistant continuously works for five wall-clock hours.

## Overall production stages
**P0 — Archive and scope:** Save five concepts, reviews, rubric, ethics, contracts and prioritized backlog. Publish a transparent working repository.
**P1 — Interactive First Prototype:** One Scene, Many Truths — immutable evidence timeline, three perspectives, active shot selector, reveal facts vs inference, no API dependency.
**P2 — Model integration:** Server endpoint, structured model output schema, invariant validator, safe prompt and error/fallback mode, logged tests. Secure credentials server-side; no .env secrets or client API key.
**P3 — Real footage:** Single physical café scene / original short clips with rights and consent; sound and timing; more nuanced edit decisions; responsive performance. Alternatively film original actors in a generic setting.
**P4 — Audience study:** Small consented usability sessions; observe reactions and interpretation; collect anonymized notes and iteration rationale. Avoid speculative effects.
**P5 — Polish and application case:** Intro video (60–90 sec), technical breakdown, story decisions, documentation, accessible deploy, role-specific portfolio and truthful resume.
**P6 — Project two:** The Things We Didn't Say; stage small emotional editing and performance prototype.
**P7 — Remaining ideas:** Museum, Place, Misunderstands; only after the first two reach finished proof.

## Suggested five-hour session (human/assisted workflow)
- Hour 1: review latest repo, outstanding issues, plan one thin vertical slice.
- Hours 2–3: implement + tests; no claims without running code.
- Hour 4: test interaction/UX, accessibility and failure modes.
- Hour 5: improve docs, screenshot, A/B/C review, commit and concise delivery report.

## First seven sessions (milestone-based, not time guarantees)
1. **Archive & offline prototype:** repo docs, first playable browser experience, semantics of facts vs inference, verify script.
2. **Narrative engine:** editable shot order / emphasis, structured data, schema validation tests, deterministic reproducible outputs.
3. **Model-connected mode:** secure backend, constrained prompt, guardrail for invariant facts, request logging without personal text storage.
4. **Original film media:** record simple multi-angle scene; add video/audio, legitimate assets, captions and rights manifest.
5. **Audience-first polish:** mobile, keyboard, focus, motion, legibility, graceful errors; 3-minute product walk-through.
6. **Evaluation:** recruit small opt-in playtest, score quality of understanding, compare two UI treatments and document limitations.
7. **Publish:** project film/demo, written case, final revisions to OpenAI-specific portfolio, honest A/B/C evaluation and next version backlog.

## Work rules for future sessions or scheduled checks
- Only advance confirmed work. An automated run **might be short** and may not have a persistent dev environment; report that limitation honestly.
- GitHub target: `reusahn/Portfolio`, branch `gh-pages`, folder `openai-experiments/`; do not overwrite original portfolio pages.
- Read `WORK_LOG.md` and this roadmap first. Work on a bounded task, run available tests, commit if authorized, and record actual changed files/commit.
- If source access or ability to execute is unavailable, document blockers without claiming changes.
- Do not automatically submit job applications or publish sensitive user inputs.
