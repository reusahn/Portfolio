#!/usr/bin/env python3
"""Static preflight for animation asset handoff manifests.

This is an independently authored, engine-agnostic QA helper. It does not
import FBX files, inspect Unreal assets, or certify final deformation.
Usage:
    python3 animation_preflight.py path/to/manifest.csv
    python3 animation_preflight.py path/to/manifest.csv --json
"""
import argparse
import csv
import json
import sys
from collections import Counter
from pathlib import Path

FIELDS = (
    "asset_id", "character", "skeleton", "fps", "start_frame", "end_frame",
    "root_motion", "face_track", "status"
)
YES_NO = {"yes", "no"}
STATUS = {"draft", "review", "approved"}
SAFE_MAX_FRAMES = 200000

def check_rows(rows):
    issues = []
    ids = set()
    if not rows:
        return [{"row": 0, "field": "manifest", "reason": "No animation assets found"}]
    for line, record in enumerate(rows, start=2):
        get = lambda key: str(record.get(key) or "").strip()
        asset_id = get("asset_id")
        for field in FIELDS:
            if not get(field):
                issues.append({"row": line, "field": field, "reason": "Required field missing"})
        if asset_id:
            if asset_id in ids:
                issues.append({"row": line, "field": "asset_id", "reason": "Duplicate asset ID"})
            ids.add(asset_id)
        if get("root_motion").lower() not in YES_NO:
            issues.append({"row": line, "field": "root_motion", "reason": "Must be yes or no"})
        if get("face_track").lower() not in YES_NO:
            issues.append({"row": line, "field": "face_track", "reason": "Must be yes or no"})
        if get("status").lower() not in STATUS:
            issues.append({"row": line, "field": "status", "reason": "Must be draft, review, or approved"})
        try:
            fps = float(get("fps"))
            if fps <= 0 or fps > 240:
                raise ValueError
        except ValueError:
            issues.append({"row": line, "field": "fps", "reason": "FPS must be >0 and <=240"})
        try:
            start, end = int(get("start_frame")), int(get("end_frame"))
            if start < 0 or end < start or end - start > SAFE_MAX_FRAMES:
                raise ValueError
        except ValueError:
            issues.append({"row": line, "field": "frame_range", "reason": "Invalid start/end frames"})
    return issues

def validate(path):
    with open(path, newline="", encoding="utf-8-sig") as stream:
        reader = csv.DictReader(stream)
        headers = reader.fieldnames or []
        missing = [name for name in FIELDS if name not in headers]
        if missing:
            return 0, [{"row": 1, "field": "columns", "reason": "Missing: " + ", ".join(missing)}]
        rows = list(reader)
    return len(rows), check_rows(rows)

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--json", action="store_true", help="Output machine-readable result")
    args = parser.parse_args(argv)
    try:
        count, issues = validate(args.manifest)
    except (FileNotFoundError, OSError, UnicodeError) as err:
        print(f"Could not read manifest: {err}", file=sys.stderr)
        return 2
    result = {"assets_checked": count, "passed": not issues, "issues": issues}
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print(f"Checked {count} manifest rows: {'PASS' if not issues else 'FAIL'}")
        for issue in issues:
            print(f"  row {issue['row']} · {issue['field']}: {issue['reason']}")
    return 0 if not issues else 1

if __name__ == "__main__":
    raise SystemExit(main())
