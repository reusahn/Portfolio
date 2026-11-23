# One Scene, Many Truths — Playable Storyboard v0.1
**Status:** Source files saved. Browser runtime tests have not been executed in this session. The underlying narrative contract has a Node test suite; results are pending external execution.

## Play
[Open the interactive storyboard](https://jonghoonahn.com/openai-experiments/one-scene/) or run any static HTTP server within this folder:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000/
```
An `import` statement loads `story.mjs`, so loading the HTML through file:// can be blocked by browser module security.

## Features (implemented in source)
- Opt-in **PLAY CUT / PAUSE CUT** timed shot playback. Pace is now functional: linger 3200 ms, measured 2200 ms, brisk 1250 ms per shot; witness pacing applies to original cuts, accepted edit pace applies to demonstration cuts. Manual navigation or perspective/focus change stops playback. The final shot remains visible after playback ends.
- A, B, C points of view with different framing, written captions and scene orders
- Shot-by-shot navigation and filmstrip; arrow-key support while the frame has focus
- Re-cut: promote a different shot to the opening frame
- Six immutable canonical facts, visible on every viewpoint
- What a witness assumes vs cannot know
- Side-by-side perspective comparison
- Entirely offline, hand-authored original vector storyboard; no AI model or external footage is represented as functioning.

## Narrative contract tests
```bash
node tests.mjs
```
The script asserts canonical facts are unchanged, alternate POVs work, shot IDs are valid, edits do not fabricate events, and invalid inputs fail. It also covers strict proposed edit plans (unexpected keys, witness mismatch, invalid/duplicate shots, unapproved captions, and immutable accepted plans). **Do not mark as passed without running the command.**

## Model proposal safety boundary (authored preview, no live model)

`edit-contract.mjs` exports `validateEditProposal`, `acceptEditProposal`, `EDIT_PLAN_SCHEMA`, and `CAPTION_IDS`. `app.mjs` **does import this contract** to validate a fixed, director-authored demonstration edit. This is not a live model call. The accepted proposal has exactly four fields: `perspective`, `shot_order`, `caption_id`, `pace`. Unexpected keys and arbitrary generated prose or facts are rejected. The proposed server-side model mode remains future work; see [the aligned specification](../ONE_SCENE_SPEC.md).

## Future production evidence
- Capture browser execution / mobile view
- Verify focus order and reduced-motion behavior
- Record user reactions with informed permission
- Integrate secure, structured model responses and validate against canonical facts
- Film licensed / original multi-angle café footage and add captions

## Editorial and safety
This is a fiction about the uncertainty of human intent. A character's statement is a belief, not a verified event. No real visitor's private memory is submitted or stored. No OpenAI or other provider affiliation is implied.

## November 9, 2026 — Shot-level evidence provenance
The interface now labels every selected shot as **OBSERVED EVENT** or **EDITORIAL CONTEXT**, with a human-authored explanation. Clock and window inserts are deliberately **not** evidence of lateness or motivation. See `evidence.mjs`; 5 new contract assertions bring the suite to 38. All 38 were executed against GitHub-retrieved source in an isolated V8 harness, **not** as Node ESM or browser QA.

## November 11, 2026 — Before/after evidence delta
The validated edit audit reports **NEWLY VISIBLE** and **NEWLY HIDDEN** fact IDs. If an edit merely reorders the same observed facts, it explicitly says the visible evidence set is unchanged. The pure comparison function is in `coverage.mjs`; five regression checks were added to `tests.mjs` (53 registered total). A reconstructed local Node fixture passed 5/5 checks, **not** the complete repository suite or browser QA. See [the daily fictional review](../DAILY_DISCUSSIONS/2026-11-11.md).

## November 12, 2026 — Timed playback screen-reader announcements
Manual shot navigation and perspective changes still update the polite live region, but timed playback no longer repeatedly rewrites it every 1.25–3.2 seconds. This is a narrow source-level accessibility improvement, **not verified with a screen reader or real browser**. Three new pure-function assertions are registered (56 total). A locally reconstructed Node v22.16.0 fixture passed 3/3 new assertions; full integrated suite not run. See [daily discussion](../DAILY_DISCUSSIONS/2026-11-12.md).

## November 15, 2026 — Reproducible QA gate (not yet passed)

From a checked-out `gh-pages` branch, run `cd openai-experiments/one-scene && node tests.mjs` and record the actual Node version, exit code, and assertion count. Then use a real browser on the deployed URL to check: (1) play, then Previous on first shot and Next on last shot; button should show `PLAY CUT` and `aria-pressed=false` after stopping, (2) timed playback ends without restarting, (3) perspective and focus changes stop playback, (4) authored preview and restore preserve the canonical ledger, (5) keyboard arrow navigation, narrow mobile layout, reduced motion, and screen-reader live announcements. **None of these browser checks is marked passed here.** A local clone attempt on 2026-11-15 failed at DNS resolution of `github.com`; the complete Node suite could not be run. See [daily fictional critique](../DAILY_DISCUSSIONS/2026-11-15.md).

## November 19, 2026 — One-command Node QA gate

From a checkout of the `gh-pages` branch, run `cd openai-experiments/one-scene && node qa.mjs`. This script checks syntax for seven local modules, then executes the existing `tests.mjs` suite **only if syntax checks pass**. It propagates a nonzero exit code on failure and prints explicit warnings that browser, screen-reader, mobile, live-model, footage, and human-study checks were not performed. It uses built-in Node APIs and requires no third-party packages. **The script was committed but could not be executed against a full checkout during this run:** container DNS resolution of github.com failed. GitHub API source access is not equivalent to Node test execution. See [November 19 discussion](../DAILY_DISCUSSIONS/2026-11-19.md).

## November 20, 2026 — Assertion-count reporting (execution pending)

`qa.mjs` now compares the number of `PASS ` assertion lines emitted by `tests.mjs` with the number of top-level `ok(` registrations in that source. It reports `Narrative assertions: observed/registered reported PASS` and exits nonzero if the count differs, the child process fails, or no assertions are registered. This guards against a silent zero-assertion success and makes future QA logs auditable; it does not verify browser behavior. The count assumes the existing one-line `ok(` registration style and is not a general JavaScript parser. **No full-checkout Node run was performed:** container GitHub DNS resolution failed. See [November 20 discussion](../DAILY_DISCUSSIONS/2026-11-20.md).

## November 21, 2026 — GitHub Actions uses the full QA entry point

The workflow `.github/workflows/creative-experiments-tests.yml` now invokes `node qa.mjs` on Node 22 for `gh-pages` changes to One Scene source (or manual workflow dispatch). This replaces a partial four-module syntax check plus `node tests.mjs` with the existing seven-module syntax gate and assertion-report accounting. The change is **committed but its GitHub Actions execution and success status have not been verified**; local checkout still fails DNS resolution. The workflow is not browser, screen-reader, mobile, AI-model, footage, or human-study QA. See [November 21 discussion](../DAILY_DISCUSSIONS/2026-11-21.md).

## November 22, 2026 — CI execution independently verified

The GitHub Actions **Creative Experiments narrative checks** run [44902583400](https://github.com/reusahn/Portfolio/actions/runs/44902583400), triggered by commit [2bc2f584887a0e6b6165bf8a954554f8332c320f](https://github.com/reusahn/Portfolio/commit/2bc2f584887a0e6b6165bf8a954554f8332c320f) on November 21, is marked **completed / success** by the GitHub Actions API. The job `narrative-contract` and its step **Run complete One Scene source QA gate** both report **success** ([job](https://github.com/reusahn/Portfolio/actions/runs/44902583400/job/136841394459)). The workflow runs `node qa.mjs` under Node 22; therefore this is independently verified CI success for the committed source-level gate, unlike earlier unverified claims. **The exact assertion PASS count and stdout were not retrieved**, so do not claim a specific number of executed assertions from this API result. This is not a browser, screen-reader, mobile, model, footage or human-study test. Next: capture full QA stdout/count, then perform manual browser accessibility checks.

## November 23, 2026 — Reduced-motion playback safeguard

The PLAY CUT handler now checks `prefers-reduced-motion: reduce` before scheduling any timed shot transitions. When that preference is active, the handler leaves playback stopped and displays a manual-navigation explanation in the existing status area. This is an opt-in autoplay guard; arrow keys and shot buttons remain available. Source commit [`5480fac277333bbd539a5c669a05dd37bd1f56ea`](https://github.com/reusahn/Portfolio/commit/5480fac277333bbd539a5c669a05dd37bd1f56ea). **Verified:** GitHub write succeeded; source-level branch readback is planned separately. **Not verified:** browser behavior under OS reduced-motion settings, mobile, screen reader or current CI. Manual browser QA is still required. See [November 23 fictional review](../DAILY_DISCUSSIONS/2026-11-23.md).
