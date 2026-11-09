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

## Model proposal safety boundary (source only)\n\n`edit-contract.mjs` exports `validateEditProposal`, `acceptEditProposal`, `EDIT_PLAN_SCHEMA`, and `CAPTION_IDS`. A future server can request structured edit choices, but no model is connected today. This file is **not imported by the browser UI** yet. Arbitrary generated prose and facts are rejected by design.\n\n## Future production evidence
- Capture browser execution / mobile view
- Verify focus order and reduced-motion behavior
- Record user reactions with informed permission
- Integrate secure, structured model responses and validate against canonical facts
- Film licensed / original multi-angle café footage and add captions

## Editorial and safety
This is a fiction about the uncertainty of human intent. A character's statement is a belief, not a verified event. No real visitor's private memory is submitted or stored. No OpenAI or other provider affiliation is implied.

## November 9, 2026 — Shot-level evidence provenance
The interface now labels every selected shot as **OBSERVED EVENT** or **EDITORIAL CONTEXT**, with a human-authored explanation. Clock and window inserts are deliberately **not** evidence of lateness or motivation. See `evidence.mjs`; 5 new contract assertions bring the suite to 38. All 38 were executed against GitHub-retrieved source in an isolated V8 harness, **not** as Node ESM or browser QA.
