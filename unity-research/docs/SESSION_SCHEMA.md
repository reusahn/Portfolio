# Context Gate event contract

This document describes the authored `ResearchEvent` and `ExperimentRunner` source. The Python contract tests use synthetic fixtures. They are not retained Unity exports, evidence that the C# compiles, or participant data. A checker cannot authenticate the origin of a hand-written JSON file.

## Run the checker

From the repository root:

```sh
python unity-research/tools/test_validate_session.py
python unity-research/tools/validate_session.py /actual/run/session.json --csv /actual/run/events.csv
python unity-research/tools/validate_session.py /actual/run/events.jsonl --allow-incomplete
```

The first command tests the Python checker with valid and deliberately invalid synthetic inputs. The other commands require files from a separately executed Unity run. No actual Unity run is supplied by the synthetic test suite.

`--allow-incomplete` permits a valid prefix to stop before `session_end`, including a request awaiting a reply or a `session_fault`. It does not permit an unknown trial, illegal move, duplicate request decision, malformed JSON line, or any other earlier integrity violation. A partially written last JSONL line must be recovered explicitly and the original retained. The checker does not silently discard it.

## Event fields

| Fields | Type | Meaning |
| --- | --- | --- |
| `sequence` | integer | Zero-based, contiguous journal order. |
| `sessionId` | nonempty string | Same identifier in every event. It is not a participant identifier. |
| `utc` | offset-bearing ISO timestamp | UTC application timestamp authored by the logger. It is not proof of synchronized clocks. |
| `elapsedSeconds` | finite nonnegative number | Monotonic process elapsed time. |
| `frame` | nonnegative integer | Nondecreasing Unity frame number as represented in the event. |
| `eventName`, `reason` | string | Known event type and its explicit reason. |
| `trialId`, `policy`, `boardSeed` | string, string, integer | Stable trial identity within an epoch. Policies are `DeliverAll` or `Revalidate`. |
| `epoch` | integer | Zero before a trial. Each trial start or reset increments it by one. |
| `revision` | integer | Zero at trial start and incremented only by a successful move. |
| `positions` | integer array | Three unique slots in 0–5, except the empty pretrial session state. Array index identifies A, B, C. |
| `requestId`, `snapshotRevision` | string, integer | Request identity and the board revision used to plan its reply. |
| `token`, `from`, `to` | integers | The referenced object and source/destination slots. `-1` is used when no placement is referenced. Malformed-response QA may contain the injected invalid destination `999`. |
| `applicable` | integer | `1` for true, `0` for false, `-1` when no applicability decision is represented. |
| `providerFault` | string | `None`, `Timeout`, or `Malformed`. This is QA injection state, not an AI-model quality score. |

All fields must be present and have the documented scalar/array types. The checker does not compare UTC intervals for latency, because wall-clock adjustments are separate from the monotonic process clock.

## Session and trial lifecycle

The first event is `session_start`. No second session start or event after a terminal session state is allowed in the same journal.

| Event | Required previous state | Result |
| --- | --- | --- |
| `trial_start` | Between trials, or just after a recorded reset | Introduces a new epoch with revision zero. |
| `object_moved` | Running | Exactly one object moves from its recorded source to an empty slot. Revision advances by one. |
| `move_rejected` / `request_rejected` | Running | The board does not change. |
| `trial_paused` | Running, with any pending request already cancelled | Pauses the trial and clears visible advice. |
| `trial_resumed` | Paused | Resumes the same epoch and board. |
| `trial_reset` | Running or paused, with pending work already cancelled | Closes the old epoch for reset. The next trial start must repeat its trial ID, policy, seed, and original positions. |
| `trial_end` | Running, with pending work already cancelled | Enters the between-trials state. `completed` requires target positions `[0,1,2]`. `trial_timeout` is recorded separately. |
| `session_end: completed` | Between trials | Closes the journal after the runner's completion path. |
| `session_end: aborted` | Running, paused, or between trials | Closes the journal through an explicit abort. An active trial does not need a preceding `trial_end`, matching the current C# source. |
| `session_fault` | A coherent known state, or the empty state before the first trial | Terminates the prefix as faulted. The current C# fault path disposes the journal without writing `session_end`; inspect it with `--allow-incomplete`. |

After a trial starts, every trial-scoped event must refer to its known current epoch and stable identity. A moved object in epoch 99 without a corresponding trial start is rejected. This was an actual defect in the earlier Python checker and is now covered by negative regression tests.

The checker verifies the represented event order, not the full trial schedule from the settings asset. Retain `metadata.json` and the actual settings with the run. A completion reason does not establish that a particular preregistered schedule was used.

## Request lifecycle

One request can be pending at a time. Request IDs cannot be reused within a session.

1. `hint_requested` records an applicable move from the current board snapshot.
2. A well-formed response produces `hint_received` followed immediately by one delivery decision. The payload must match the requested token, source, destination, and snapshot revision.
3. `hint_displayed` or `hint_discarded` resolves the request. Revalidate may display only applicable moves and discard only inapplicable ones. DeliverAll may display a well-formed stale move.
4. `hint_timeout`, `hint_cancelled`, or `provider_error` can instead resolve a still-pending request. A malformed-response event may contain the deliberately corrupted destination, but must retain its request identity.
5. A second resolution is rejected. Reset, pause, trial end, and normal abort must not strand pending work.

A shown hint is cleared on the next successful move. `hint_cleared` records that action with reason `user_move`. Pause, reset, trial end, and abort also clear visible advice through their explicit lifecycle events.

The related-action check is deliberately more specific than an overall board revision check. A move of an unrelated object can leave the original hint's source and destination preconditions intact. Both delivery policies can retain that hint. This mechanism does not prove that the advice is optimal or welcome.

## Checker output

- `journal_closed`: the event stream has a valid `session_end` and no unresolved requests.
- `complete`: a compatibility alias of `journal_closed`. It does not mean the task succeeded.
- `session_outcome`: `completed`, `aborted`, `faulted`, or `incomplete`.
- `run_completed`: the runner's normal session-completion path was recorded. Individual trials may still have timed out. No behavioral or scientific success is implied.
- `trial_epochs`: number of introduced epochs, including resets.
- `unresolved_requests`: unresolved work retained in a recovered prefix. It must be zero in a closed journal.
- `flagged_trial_epochs`: resets, pauses, and injected provider faults that require analysis attention.
- `counts`: event and exposure counts. These are consistency summaries, not behavioral findings.

The CSV comparison checks every represented event field, including trial epoch, revision, seed, frame, provider fault, and positions. JSONL and JSON events share the same validator. A matching CSV does not authenticate either file or establish timing accuracy.

## Acceptance checks before using the Unity scene for a study

| Operator action | Expected event evidence |
| --- | --- |
| Request on an unchanged board | Request → receive → applicable display in both policies. |
| Move the suggested object before receipt | Inapplicable receive, then baseline display or Revalidate discard. |
| Occupy the advised destination | The same comparison, with a destination-precondition failure. |
| Move an unrelated object | A valid source/destination remains applicable despite a changed global revision. |
| Reset with a pending request | Cancellation → reset → new epoch with the same original layout. |
| Pause or lose focus while waiting | Cancellation → pause → explicit resume. |
| Inject timeout | One timeout resolution, unchanged board, usable subsequent input. |
| Inject malformed reply | One provider error, no displayed malformed advice. |
| Abort while running | Pending request cancellation if needed, then `session_end: aborted`; `run_completed` false. |
| Encounter a logger failure | Stop the run and retain raw output. A fault prefix may be incomplete or unrecoverable. Never replace missing events with fabricated success records. |

These are expected checks derived from source. They still require an actual Unity import, run, build, and retained export. Application timestamps are not physical stimulus onset, headset latency, eye-tracker synchronization, or EEG synchronization.
