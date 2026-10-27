# C / Simulated Unity and XR engineering review

This is an independent simulated review, not an endorsement by a lab member or a professional who inspected the private projects. Files were reviewed statically on 27 October 2026. Unity, a C# compiler, and an HMD were unavailable. No Unity compile, play session, or hardware run is asserted.

## Two scorecards with different meanings

### Portfolio editorial and technical communication: 76 / 100 before this revision

| Criterion | Weight | Current | Full-credit evidence |
| --- | ---: | ---: | --- |
| Personal ownership and provenance | 20 | 18 | Every selected case names the personal implementation, collaboration credit, original archive, and whether sample source is independent. Ambiguous collaborative ownership is visible. |
| Inspectable technical boundaries | 20 | 14 | A reviewer can reach the concrete source, exact mechanism, setup, and current validation status without searching through generic prose. |
| Decision and failure reasoning | 20 | 12 | Three priority cases connect a real design choice to a specific failure case to exercise and an observable outcome. Unobserved failures are described as planned checks. |
| Reproduction and handoff | 20 | 18 | A reviewer can identify the engine/render-pipeline assumptions, commands, expected artifacts, current limitations, and next validation step. |
| Relevance and information order | 20 | 14 | The first work supports an implementation discussion. Related research is a precise task or component contribution. The first screen remains short and the complete collection remains available. |
| **Total** | **100** | **76** | |

An editorial score of 100 can describe a fully closed communication checklist. It must not be presented as evidence that Unity compiled, that all works are ready to share, or that a professor would hire the author.

### Research-system execution readiness: 38 / 100 from the existing inspectable record

| Criterion | Weight | Current | Reason |
| --- | ---: | ---: | --- |
| Task model and condition control | 20 | 17 | Pure model, paired conditions, frozen settings, clear policy difference. Existing executed checks concern the JavaScript model, not C# parity. |
| Lifecycle and fault containment | 20 | 12 | Pause, reset, epochs, timeout and malformed-response branches exist in source. Engine behavior is unverified. Constructor failure cleanup required a repair. |
| Reproducible environment | 20 | 5 | Setup instructions exist. There is no executed Unity version/package/build record for this source. |
| Unity and target-device execution | 20 | 0 | No new Unity compile, Edit Mode run, desktop binary, or HMD run is present. |
| Recording and analysis verification | 20 | 4 | Journal and consistency validator exist. No actual Unity-exported session is supplied. |
| **Total** | **100** | **38** | |

The execution score should advance only when the corresponding artifacts exist. This is not a score of the artist's entire development history.

## Technical findings and small source repair

### Fixed in this pass: EventJournal constructor cleanup

File: unity/Assets/ContextGate/Runtime/EventJournal.cs.

Previously, opening events.csv was guarded, but writing and flushing its header were outside that guard. A storage failure after both writers were acquired could throw from the constructor before the caller held a disposable journal. Both file handles could remain open until later collection. The code now holds newly acquired writers in local variables, closes both on any creation/header failure, and commits them to readonly fields only after header initialization succeeds. NewWriter also closes its FileStream if constructing the StreamWriter fails. Cleanup preserves the primary exception if Dispose also throws.

Validation: static control-flow review only. No Unity or C# compile was possible. Do not write “fault injection passed” for this repair.

### Additional small issue for the owner

ExperimentRunner.SecondsLeft uses journal.Elapsed while State is Paused. The actual deadline is extended on Resume, so the timer semantics remain paused, but the operator UI countdown continues during a pause and jumps back after resumption. Suggested property calculation:

```csharp
public double SecondsLeft => journal == null ? 0 :
    Math.Max(0, trialDeadline - (State == RunState.Paused ? pausedAt : journal.Elapsed));
```

This is a display consistency repair. Verify by pausing for several seconds and comparing the displayed time before and after Resume.

### Source strengths to retain

- PortraitInbox explicitly uses one sender, a bounded two-frame queue, complete-frame reads, PNG dimension/size checks, and main-thread Texture2D decoding. Its limits are documented. Do not market it as the original four-person installation or a style-transfer implementation.
- ShaderFlowController keeps the transform separate from an integrated noise phase, uses a MaterialPropertyBlock, and expands/restores renderer bounds. The shader's approximate normals and lack of shadow/collider updates are stated. Do not add a batching or speed claim.
- NpcProgressGate separates reply presentation from evidence/code-controlled progression and invalidates old turns/epochs. It is an independent example, not audited production Escape Metro source.
- BoardState makes copied snapshots and preserves applicable advice after unrelated moves. That precondition test is a more informative contribution than discarding every reply after any revision change.

## Priority case order

For a lab engineering introduction, I would first show To Eternity, Erick Oh, and Escape Metro or Jemulpo. These support concrete discussion of sensing/sequence boundaries, real-time rendering control, and asynchronous results. Fineo is a valuable artistic and visualization case, but its collaborative implementation ownership is less isolated in the archive. NARCI's concept is strong, while tracked-input and reset behavior need a current technical capture. All fifteen works should remain in the catalog.

This is an editorial recommendation based on the inspected artifacts, not a statement of Tobias Höllerer's preference. A concise optional “Start here” row is preferable to filling the home page with new pitch text.

## English copy for priority case pages

The following text is a draft for new portfolio analysis. “Failure case to exercise” describes a proposed diagnostic action. It is not a historical production incident.

### Erick Oh collaboration

**Decision**
Keep object motion, internal field flow, and authored growth as separate controls. The independent example integrates flow into shader phase and updates per-renderer parameters without moving the object.

**Failure case to exercise**
Reverse flow while holding the transform fixed. Then raise displacement near the camera's frustum edge. Inspect continuity and clipping. This check is proposed; no captured result is reported here.

**Observable evidence**
Record the Game view and Inspector together. Show the flow reversal, maximum displacement, unchanged transform, and renderer bounds. Pair that capture with the actual shader and controller version.

**Reuse boundary**
The public example explains phase control and conservative bounds. It does not reproduce the production cloud shader or raymarched metaballs. It does not update colliders, shadow geometry, or displaced normals.

### To Eternity

**Decision**
Keep live sensor input distinct from authored Timeline time. The integration connects participant activity to a media sequence while preserving control over the composition.

**Failure case to exercise**
Leave the tracking area during a sequence and return. Inspect how the current project handles interrupted participation and prepares for the next visitor. Recovery behavior must be demonstrated from the original project.

**Observable evidence**
Capture the Azure Kinect view, the input-to-event boundary, and the Timeline playhead in one continuous recording. Show the transition into the memorial image and the actual reset path.

**Reuse boundary**
This case demonstrates sensor-to-sequence integration. The original recognition rule, sensor setup, and reset behavior must be captured before another project can reuse them. No numerical tracking-accuracy or emotional-effect claim is made.

### Escape Metro

**Decision**
Give dialogue a task consequence. The original project connects GPT NPC conversation to a puzzle and progression. The independent source further separates reply presentation from the rule that authorizes an unlock.

**Failure case to exercise**
In the independent example, return a reply from an earlier turn, reset before a reply arrives, and attempt an unlock without puzzle evidence. Inspect rejection and progression separately. These are source-defined checks with Unity execution pending.

**Observable evidence**
Record the reply identifiers and three outcomes: an outdated reply is rejected, a valid reply is presented, and progression changes only when its own conditions are met. Show the corresponding source in the same walkthrough.

**Reuse boundary**
NpcProgressGate illustrates turn/epoch validation and an explicit progression rule. It includes no speech service, model API, original NPC prompts, or complete escape game.

### Jemulpo Photo Studio / optional fourth technical reading

**Decision**
Separate portrait transformation from transport. Barracuda, OpenCV, style processing, filters, and composition form the image pipeline. The separate TCP example concerns only complete-frame delivery to Unity's main thread.

**Failure case to exercise**
Split a PNG into small network chunks, then disconnect midway through a frame. Verify that incomplete bytes never replace the displayed portrait. Test disable/re-enable while a sender is connected.

**Observable evidence**
For the original work, show one portrait through the actual transformation layers. For the independent sample, pair sender output with Unity's receiver status and displayed texture. Do not combine those captures into a claim that the sample reproduces the original installation.

**Reuse boundary**
The public receiver is one-sender transport code. It excludes original inference, multi-participant routing, UDP, archival storage, and delivery acknowledgements.

## Changes that would make collaboration easier

1. Replace repeated generic section headings with a mechanism-specific heading for the three priority cases.
2. Place a compact “Inspect / Run / Verify / Current limit” block beside every public source example.
3. Offer an artifact manifest: file, purpose, independent/original provenance, engine assumption, validation state, and exact expected output.
4. Attach one completed engineering run before using “experiment-ready.” The valuable first run is a desktop Unity session with a normal completion, reset, timeout, malformed reply, abort, and retained logs. XR adaptation follows that record.
5. Retain artistic questions as the motivation. Proposed study sections need not be the same length for every work and should not make an artwork look like a completed controlled study.
