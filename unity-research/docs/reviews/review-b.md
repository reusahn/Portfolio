# B review: a hypothetical Four Eyes Lab postdoctoral collaborator

This is a simulated collaboration review, not a statement by an actual Four Eyes Lab member. The question is: could I hand Jonghoon one interaction component in my experiment, understand its boundaries, and reproduce the next engineering check?

## Overall assessment

The source is appreciably more useful than a gallery of finished visuals. BoardState is separate from UnityEngine. ExperimentRunner freezes session settings, controls paired trials, rejects overlapping requests, cancels pending work at lifecycle boundaries, and records complete object positions. The independent TCP example distinguishes a network worker from Unity's main thread. The NPC example keeps model-facing text separate from explicit puzzle authorization. These are inspectable design judgments.

The current portfolio still asks a potential collaborator to infer too much. Fineo is a persuasive artwork, but it is not the strongest opening proof of experiment operations. I would first inspect To Eternity's physical-input-to-sequence boundary, a small public code boundary, then Context Gate's lifecycle and exports. None of those substitutes for the original artist's identity or requires removing the other 15 works.

The most consequential missing evidence is an actual Unity run with logs. The most consequential fix available in this environment is a defect in the Python event validator.

## Initial editorial rubric: 65 / 100

This rubric scores what a collaborator can inspect in the portfolio package. It does not score the artist's worth or predict admission, hiring, funding, or faculty interest. A score of 100 requires the listed artifacts to be present and their verification scope to be accurate.

| Criterion | Maximum | Initial | Observable requirement for full credit |
| --- | ---: | ---: | --- |
| Personal ownership and usable interfaces | 20 | 16 | State exactly what Jonghoon implemented, which component I can call or replace, and which evidence belongs to independent examples. |
| Experiment control and scientific boundaries | 20 | 17 | A single question, a manipulable condition, held variables, failure paths, and the difference between mechanism validation and a behavioral finding are explicit. |
| Reproduction and handoff | 20 | 11 | One short entry point leads to source, supported versions, setup, exact commands, expected outputs, and an actual or explicitly pending verification record. |
| Diagnostics and data integrity | 20 | 12 | Event schema and lifecycle can be checked. Negative fixtures demonstrate that corrupt state transitions are rejected. Unknowns are visible. |
| Efficient technical reading | 20 | 9 | A simple two-column entry leads to the strongest implementation boundaries in under a minute. The prospective contribution is concrete and does not repeat generic research enthusiasm. |

## Verified defect: unknown trial epochs are accepted

File: `unity-research/tools/validate_session.py`.

The validator handles board mutations only in `elif epoch in states`. An `object_moved` event whose epoch was never started simply skips that branch. The following three synthetic events were passed directly to `validate()` in Python during this review:

1. `session_start`, sequence 0, epoch 0, no board.
2. `object_moved`, sequence 1, epoch 99, trialId `never-started`, positions `[3,4,5]`, token 0, from 0, to 0.
3. `session_end`, sequence 2, epoch 99, no board.

The output was `complete: true`, with one moved object and no error. There was no trial_start, the move was invalid, and no trial_end existed. This is a real Python-validator failure reproduced from source. The events are a synthetic negative fixture, not a Unity export, user study, or measured runtime result.

### Recommended repair

- Require the first event to be session_start and reject subsequent session_start events.
- Require every trial-scoped event to refer to a known active trial epoch.
- Reject moves and requests outside Running. Track pause/resume and reset epochs.
- Require trial identity, policy, and board seed to remain consistent within an epoch.
- Require one terminal request decision per request.
- Require trial_end/reset/abort transitions to resolve the active epoch consistently.
- Separate `journal_closed` from `study_completed`. An aborted session can have an intact log without being a completed experimental session.
- For recovered JSONL, allow a genuinely incomplete terminal state only through an explicit option. Do not relax intermediate integrity rules.
- Add positive and deliberately corrupted fixtures and execute them in Python. Label them synthetic schema fixtures.

Do not promote those fixtures as evidence that the Unity logger produced a valid session. The Unity logger must still be run independently.

## Source issues and priorities

### Can be improved now

1. **A one-page collaborator entry.** On the source/research page, show three deliverables: a Unity input adapter, explicit task state, and an inspectable event export. Link each statement to the corresponding actual file. Keep the main heading `Unity-based projects` and retain the two-column catalog.
2. **Put source-only limits beside the action.** Keep “Unity runtime verification pending” adjacent to the source download and prototype link. Avoid burying the statement at the end of a page.
3. **Use an actual acceptance table.** Name the expected event sequence for unchanged advice, moved-source advice, occupied destination, unrelated action, reset, pause, timeout, malformed response, and abort. Include the command that would validate the result.
4. **Record provenance of a run.** SessionReport currently contains unityVersion and platform, but not a commit SHA, precise project/package versions, or graphics API. Add a small run-manifest template even if actual values are blank. Keep a planned manifest distinguishable from a completed run record.
5. **Package an isolated setup.** The current bundle is Assets plus notes, not a fully pinned Unity project. Present it that way. A package manifest or tested Unity project is a future handoff improvement after its actual version has been established.
6. **Make the research contribution narrow.** Use the existing statement: a Unity harness that revalidates delayed placement hints against explicit object-state preconditions and records delivery/cancellation decisions in paired trials. Do not claim XARP integration, LLM behavior, EEG synchronization, or improved recovery time.

### Need actual Unity or original-project access

- Import, compile, and run the authored C# and shader sources.
- Run the eight Edit Mode tests and preserve the Test Runner output.
- Build and execute the desktop scene. Save a normal session and an abort session.
- Validate actual JSON/CSV/JSONL. Keep the original files, not screenshots alone.
- Capture a deliberate application-focus loss and subsequent explicit resume.
- Verify that material/shader lookup survives a player build, since Shader.Find behavior and included shader variants must be checked in the actual build.
- Check disk-write failure behavior. EventJournal attempts durable discrete-event flushing, but this is not a guarantee against OS/storage failure.
- Validate Quest input, tracking loss, UI, and lifecycle only after an XR adapter exists.

## Minimal capture order

| Capture | Exact content | Why I would care |
| --- | --- | --- |
| To Eternity, 45–75 seconds | Physical sensor input, Unity callback/state, Timeline playhead, composed output, next visitor reset | Shows the physical-to-engine boundary and installation operations. |
| NARCI / Be NARCI, 45–75 seconds | Tracked hand, actual interaction event, allowed action/state, visual response, role reversal | Shows that concept is carried by working interaction rules. It is not evidence of clinical efficacy. |
| Context Gate, 60–90 seconds | Settings → start trial → request → related and unrelated moves → delivery decision → reset/timeout → exported log | Shows experiment controls and failure handling in a source example that can be handed to another researcher. |

These are required future captures, not existing footage that I observed during this review.

## Suggested collaborator-facing copy

> I build the Unity layer between an interaction idea and a task that can be inspected: input mappings, explicit state, visual feedback, and event records.

> For a first collaboration, I would implement one complete interaction path and its failure checks. The team can then inspect the behavior, change a condition, and decide whether the task is ready for a study.

> Context Gate is an independent source prototype. Its code, protocol, setup, and validation tools are available. Unity compilation and device execution remain pending.

These are proposals about the scope Jonghoon could take on, not claims of prior research-lab employment.

## Simulated discussion contribution

**B:** “A strong artistic premise gets my attention. I decide whether I want to work together when I can identify the function I will call, the state it changes, the record it writes, and what happens after it fails.”

**B:** “Do not add another project. Repair the validator, expose the handoff, and show one uninterrupted Unity run. Those changes would do more for collaboration confidence than another page of research language.”

**B:** “A clean website can receive full editorial credit within a declared scope. An unrun Unity prototype cannot receive full runtime-evidence credit. Keeping both judgments separate protects the trust the portfolio is trying to earn.”

## Runtime-evidence judgment

Not scored as verified readiness. The reviewed record expressly states that no new C# file, shader, scene generator, Unity test, desktop binary, or Quest build was executed. There is therefore no basis for a verified runtime score of 100. Source quality and planned checks can be assessed, and a first engineering conversation is justified. The next evidence milestone is one successful import/test/build/export sequence plus its retained logs.

## Work actually completed after this review

At the parent agent's request, B modified only `tools/validate_session.py`, added `tools/test_validate_session.py`, and added `docs/SESSION_SCHEMA.md` within the portfolio. No Unity C# or webpage was changed by B.

The Python checker now rejects events in unknown/inactive epochs, identity changes, illegal moves, incompatible pause/reset/end transitions, overlapping requests, duplicate request resolutions, and actions after a terminal session state. Recovery permits only a missing valid tail and retains unresolved/faulted status. It does not waive invalid earlier transitions. CSV parity now covers all event fields.

The output distinguishes `journal_closed` from `run_completed`, so an aborted but intact log is not labeled a normally completed run. A source-consistent abort may occur during a running or paused trial without `trial_end`. The source's fault path is handled as a recoverable incomplete prefix when the represented events remain coherent.

The final Python execution passed **66 tests: 21 positive and 45 negative test methods**. Most negative methods check both strict and recovered-prefix modes. The tests also call the CLI on synthetic JSON and JSONL reports with matching CSV. The exact stdout/stderr is retained in `/workspace/scratch/38bb5d0a909e/validator-tests.txt` with a scope header. This validates the Python checker using synthetic fixtures. It does not verify that Unity emits those events.

The defect's repaired checker and acceptance contract materially improve diagnostics and handoff. A final full rubric score should follow inspection of the parent agent's finished pages. Runtime evidence remains pending.
