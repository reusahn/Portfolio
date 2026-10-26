# Unity source setup and verification

Status: source authored. Unity compilation, execution, and device checks remain pending.

## Import

1. Start a separate Unity 2022.3 LTS desktop project. Use Built-in for the Context Gate demo or URP for both the demo and shader example. HDRP is not targeted by these new examples.
2. Extract Unity_Research_Source.zip.
3. Copy unity/Assets/ContextGate and unity/Assets/ResearchSamples into your project's Assets folder.
4. Let Unity generate .meta files and compile. No existing scene GUIDs or client assets are required.
5. Install Unity Test Framework through Package Manager if you want to run the authored tests. Record the actual Unity, package, and graphics API versions used.
6. Run Tools > Jonghoon Research > Create Context Gate Demo. The menu asks to save modified scenes before opening a generated scene.
7. It creates Assets/ContextGate/Generated/Settings.asset and ContextGate.unity. Select Settings.asset, inspect its values, then press Play and Start a new session.

## Context Gate

The default session has three paired layouts, six trials, and a 1.5-second scripted reply delay. A pair uses the same board seed in both delivery conditions. The order alternates AB/BA and can be reversed between sessions.

A is red, B is blue, C is ochre. Their targets are slots 1, 2, 3. The upper row has slots 1–3. The lower row has buffer slots 4–6. Select a token and a destination in the operator UI. Occupied destinations are rejected. The scene is a desktop engineering interface, not a tracked-hand XR task.

Settings are frozen at session start. Editing the settings asset mid-session does not change that session's recorded configuration.

The scripted provider chooses a direct goal move when possible. If a cycle blocks all goal moves, it uses an empty buffer. It is not an LLM, a general planner, or a claim about AI intelligence.

Check these paths:

- Request help, then move the suggested object before its reply. In DeliverAll the stale, well-formed hint can be displayed. In Revalidate it is discarded.
- Request help, then move an unrelated object without changing the hinted move's source or destination. Revalidate should retain the hint.
- Request help, then reset. The pending request is cancelled and the trial epoch changes.
- Inject timeout. The request times out and the board remains usable.
- Inject malformed response. Neither policy displays a malformed payload.
- Pause or lose application focus. Pending work is cancelled. Resume explicitly.
- Complete a trial and press Next trial. At the end, press Next trial / finish session.
- Abort during a pending request. The cancellation and session end should appear in the output.

The UI shows output under Application.persistentDataPath/ContextGate/<random-session-id>. Each run has metadata.json, events.jsonl, events.csv, and, after normal finish or abort, session.json.

Events contain UTC, monotonic elapsed time, Unity frame number, trial ID and epoch, board seed, board revision, snapshot revision, request ID, token, source and destination, applicability, failure mode, reason, and complete object positions. Values are application processing timestamps. They do not establish physical stimulus onset or EEG clock synchronization.

Discrete JSONL and CSV events are flushed as they are recorded. This reduces the amount of unflushed application data but is not a guarantee against OS or storage failure. A logging failure stops the run. If a final JSON export is interrupted, retain the raw journal.

## Edit Mode tests

Open Window > General > Test Runner and run Jonghoon.ContextGate.Tests in Edit Mode.

Eight tests are authored for source changes, unrelated actions, destination occupancy, snapshot copying, rejected moves / malformed hints, cyclic layouts, reproducible layouts, and paired policy order. These tests have not been run in this session.

## Desktop build

1. Open the generated scene.
2. Add only the intended demo scene to Build Settings for the isolated project.
3. Choose a desktop target and a Development Build for the first captured run.
4. Run the binary, repeat the lifecycle checks, and retain its logs.
5. Record the build's Unity version, OS, CPU, GPU, graphics API, display, and resolution before making any performance statement.

A Quest build is additional work. The current IMGUI operator interface and desktop placement input do not demonstrate XR usability. Add an XR Interaction Toolkit or other input adapter that calls ExperimentRunner.Move. Validate controller / hand input, tracking loss, app focus, and the actual on-device UI. Do not call the source Quest-ready before running it.

## Graphics example

Requires URP. Create a material with Jonghoon/ResponsiveField, apply it to a sufficiently subdivided mesh, and attach ShaderFlowController to the same object's MeshRenderer. Change flow, amplitude, and intensity.

This uses integrated phase and simplified value noise. It does not reproduce the original production Perlin / metaball shader. It does not alter colliders, provide shadow passes, or recompute displaced normals. The unlit rim is approximate. Renderer bounds are expanded conservatively and restored on disable.

MaterialPropertyBlock avoids cloning the material for these parameter changes. It is not evidence of a speed improvement or SRP batching compatibility. Measure the actual scene before claiming a benefit.

## TCP example

Attach PortraitInbox to an object. Assign a display Renderer with a texture-using material. Default port is 8031, loopback only. Start the component, then run:

    python tools/send_portrait.py portrait.png
    python tools/send_portrait.py portrait.png --chunk-size 7
    python tools/send_portrait.py portrait.png --disconnect-after 40

The PNG must be at most 2048×2048 and 4 MiB. A four-byte network-order length prefixes each frame. A worker reads complete packets into a queue bounded to two pending images. Unity decodes at most one queued PNG per Update and replaces the texture on the main thread.

An interrupted packet must not replace the previous image. Disable / re-enable the component while a client is connected to check shutdown and port reuse. The sender reports bytes sent, not display confirmation.

This example accepts one active sender at a time. It does not implement multi-participant routing, OpenCV inference, archival storage, UDP, reconnect backoff, delivery acknowledgement, or the production installation. Those would be separate, justified extensions.

## NPC progression example

NpcProgressGate is an independent example. Call BeginTurn and include its turn number and Epoch in a reply JSON with text and cue (speak or hint). Old turn / epoch values, timeout, empty text, and unknown cues are rejected.

The model-facing reply method can present text. RegisterPuzzleEvidence and EnterCode control the separate puzzle rule. ResetPuzzle increments the epoch and invalidates pending replies. No API, STT, TTS, or production Escape Metro source is included.

## Offline checks

JavaScript task model:

    node tools/check_browser_model.cjs

Unity event consistency, after running Unity:

    python tools/validate_session.py /path/to/session.json --csv /path/to/events.csv

Recovered raw journal:

    python tools/validate_session.py /path/to/events.jsonl --allow-incomplete

The Python validator checks event consistency. It does not verify rendering, input latency, task suitability, or participant behavior.
