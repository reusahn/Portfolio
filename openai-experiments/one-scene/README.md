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
The script asserts canonical facts are unchanged, alternate POVs work, shot IDs are valid, edits do not fabricate events, and invalid inputs fail. **Do not mark as passed without running the command.**

## Future production evidence
- Capture browser execution / mobile view
- Verify focus order and reduced-motion behavior
- Record user reactions with informed permission
- Integrate secure, structured model responses and validate against canonical facts
- Film licensed / original multi-angle café footage and add captions

## Editorial and safety
This is a fiction about the uncertainty of human intent. A character's statement is a belief, not a verified event. No real visitor's private memory is submitted or stored. No OpenAI or other provider affiliation is implied.
