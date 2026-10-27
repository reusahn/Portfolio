# Context Gate / run acceptance record

Status: template for the next Unity run. No completed run is implied by this document.

## Declare the environment before running

- Source release: context-gate-0.1.1. Retain downloads/source-manifest.json with the run.
- Unity version, exact patch: pending. 2022.3 LTS is the authoring target, not an executed compatibility result.
- OS, CPU/GPU, render pipeline and package versions: pending.
- Operator and date: pending.
- Project import / Console errors / generated scene path: pending.
- Run folder and source-manifest SHA-256: pending.
- Input mode: start with the supplied desktop operator UI. No XR input is claimed.

## Import and create the scene

Follow UNITY_SETUP.md. Copy unity/Assets into a new project’s Assets folder. Keep ResearchSamples separate when testing only Context Gate. The independent ResponsiveField shader targets URP. An engine or pipeline mismatch is a setup finding to record.

Run Tools > Jonghoon Research > Create Context Gate Demo. Inspect Settings.asset and record its copied session configuration. Compile, run the eight authored Edit Mode tests, then build a desktop executable. Save the unedited Console and Test Runner result.

## Acceptance matrix

| Check | Expected behavior | Current record |
| --- | --- | --- |
| Clean import | Source compiles and scene menu creates a scene/settings asset. | Unity verification pending |
| Unchanged board | Both delivery policies show applicable advice. | Unity verification pending |
| Relevant object or destination changes | DeliverAll may display inapplicable advice. Revalidate records a discard. | Unity verification pending |
| Unrelated move | Advice survives when its original source/destination predicates still hold. | Unity verification pending |
| Pause / resume | Pending request is cancelled. Displayed remaining time stays fixed while paused and resumes consistently. | Source repaired; Unity verification pending |
| Reset / abort | Pending request resolves as cancelled. Reset has a new epoch and known layout. Abort is distinct from study completion. | Unity verification pending |
| Timeout / malformed reply | Explicit error or timeout. No fabricated progression. | Unity verification pending |
| Storage failure | Session faults visibly. Acquired writers are released when journal initialization fails. | Source repaired; Unity verification pending |
| Output agreement | JSONL, CSV and final session JSON contain matching records. The raw logs pass validate_session.py. | Real Unity export pending |
| Independent handoff | Another person reproduces one sequence using this runbook. | Additional production needed |

## Keep these files together

1. The exact source manifest and session metadata/configuration.
2. A continuous Game-view + Inspector recording, including the failure checks.
3. Raw events.jsonl and events.csv. Keep session.json when finalization succeeded.
4. Validator stdout/stderr and exit status. Preserve failed traces and their reasons.
5. The desktop build, engine/package record and reproduction note.

From the extracted source-bundle root, or from `unity-research/` in the repository, use:

    python tools/validate_session.py /path/to/session.json --csv /path/to/events.csv
    python tools/validate_session.py /path/to/events.jsonl --allow-incomplete

Only use --allow-incomplete when recovering an interrupted journal. It does not relax invalid intermediate transitions. Consult SESSION_SCHEMA.md for exact supported inputs and output-parity behavior.

## Timing and research boundaries

Application timestamps establish processing order and elapsed application time. They do not measure physical display onset, sensor latency, eye-tracker or EEG synchronization. No participant study is reported. The matching task is an engineering harness; task validity and learning effects need a separate study design.

## First existing-work captures

- To Eternity: Azure Kinect input, mapped Unity event, Timeline playhead, visible composition and actual return/reset behavior in one recording.
- Erick Oh: production shader controls and the independent example must be identified separately. For the sample, show phase reversal, unchanged Transform, and displaced bounds near the frustum edge.
- Escape Metro: show the original dialogue-to-puzzle transition. Separately exercise old-turn/reset/unauthorized-unlock cases in NpcProgressGate.

These are specified captures to make. They are not descriptions of recordings already produced in this update.
