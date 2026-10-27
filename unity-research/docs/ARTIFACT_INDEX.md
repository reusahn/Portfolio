# Inspectable artifacts

All code in the download is independently authored for this portfolio. Existing project videos document original works. They are different evidence items.

| Artifact | Boundary / expected output | Target / validation |
| --- | --- | --- |
| BoardState.cs | Copied board state, unique slot occupancy, deterministic legal hint, explicit move predicates. | Pure C# source. C# compile and Unity tests pending. |
| ExperimentSettings.cs | Settings copied at session start; paired trial schedule. | Unity 2022.3 authoring target. Execution pending. |
| ExperimentRunner.cs | Request / epoch / trial lifecycle; timeout, reset, pause and abort. | Unity source. Paused display corrected in 0.1.1. Runtime pending. |
| EventJournal.cs | Metadata + JSONL + CSV + final JSON. | Unity source. Constructor cleanup reviewed in 0.1.1. Actual exports pending. |
| ContextGateSceneBuilder.cs | Editor command to create the demo scene and settings. | Editor execution pending. No serialized scene is misrepresented as generated. |
| ContextGateDemo.cs | Desktop operator UI and spatial board display. | Unity execution / desktop build pending. |
| BoardStateTests.cs | Eight authored Edit Mode model tests. | Unity Test Framework required; not executed here. |
| ShaderFlowController.cs + ResponsiveField.shader | Per-renderer phase/displacement controls with conservative bounds. | Independent URP sample. Not the production cloud shader or metaball implementation. Compile, visual continuity and clipping checks pending. |
| PortraitInbox.cs + send_portrait.py | Bounded one-sender PNG transfer; worker transport and main-thread decode. | Independent example. Sender source exists; end-to-end Unity reception pending. Excludes style transfer and original four-person routing. |
| NpcProgressGate.cs | Turn / epoch validation and explicit progression authorization. | Independent example. Unity execution pending; no model service or complete game. |
| validate_session.py + test_validate_session.py | Lifecycle checks, state invariants and output-format agreement. | Python standard library. 66 synthetic fixture tests executed; no real Unity exports supplied. |
| context-gate-model.js + check_browser_model.cjs | Separate browser model and exhaustive small-board assertions. | JavaScript only. Does not verify the C# implementation. |

Use downloads/source-manifest.json on the website or SOURCE_MANIFEST.json in the archive to identify the exact source revision by file hashes. A manifest establishes file identity. It does not establish runtime behavior.

For a first reviewed Unity run, complete HANDOFF_CHECKLIST.md and retain the raw files. Do not replace missing events or failed trials with hand-authored success records.
