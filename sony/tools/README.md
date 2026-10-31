# Capture Package QA

A small standalone Python prototype by Jonghoon Ahn, authored for this portfolio in October 2026.

It checks the contract between capture intake and a receiving DCC / engine: package IDs, source-file presence, declared frame rates, inclusive source ranges, clap / sync-event offsets, and destination export metadata.

It **does not** decode FBX, Alembic, depth, or video files, evaluate animation or likeness quality, correct the capture data, or certify the output of a historical production. The included sample uses synthetic metadata and plain-text stand-ins rather than captured performance files.

## Run

Python 3.9 or later; standard library only.

```bash
python capture_package_validator.py sample_manifest.json --root . --output sample_report
```

Produces `sample_report.json` and `sample_report.html`. A packaging error returns exit status 1; a review warning returns 0 with status `REVIEW` in the report.

## Coordinate and timing convention

`sync_frame` is the absolute source frame index of the shared event. Frame ranges are inclusive. Face timeline translation is:

`body_sync_frame / body_fps - face_sync_frame / face_fps`

This scalar offset aligns one event. It is not drift correction or automatic performance synchronization. The receiving DCC remains responsible for resampling, timecode interpretation, deformation and final frame-by-frame review.

## Test

```bash
python -m unittest test_validator.py
```

The tests use synthetic manifests and temporary text fixtures. Planned additions include inspecting actual FBX / Alembic metadata, project-specific naming profiles, and a real capture-package field trial; these are not implemented in this prototype.
