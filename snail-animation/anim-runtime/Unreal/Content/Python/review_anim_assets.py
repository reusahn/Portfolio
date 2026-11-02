"""Read-only Unreal Editor animation asset audit.
Run within Unreal Editor: py "<project>/Content/Python/review_anim_assets.py".
Scans /Game/AnimationReview and writes Saved/AnimationAudit/animation_audit.json.
No assets are edited. Requires Unreal's Python Editor Script Plugin.
"""
import json
import os
from datetime import datetime, timezone
FOLDER = "/Game/AnimationReview"

def evaluate(records):
    warnings = []
    if not records:
        warnings.append({"asset": FOLDER, "issue": "No UAnimSequence assets were found"})
    for item in records:
        if not item.get("skeleton"):
            warnings.append({"asset": item.get("path", "?"), "issue": "Missing skeleton"})
        length = item.get("seconds")
        if length is None or length <= 0:
            warnings.append({"asset": item.get("path", "?"), "issue": "Missing or zero animation duration"})
        if item.get("root_motion") is None:
            warnings.append({"asset": item.get("path", "?"), "issue": "Root motion flag unavailable; verify in Editor"})
    return {"passed": not warnings, "animation_sequences": len(records), "warnings": warnings}

def safe_call(asset, method):
    try:
        return getattr(asset, method)()
    except Exception:
        return None

def safe_property(asset, prop):
    try:
        return asset.get_editor_property(prop)
    except Exception:
        return None

def run(folder=FOLDER):
    import unreal  # Only available in Unreal Editor.
    paths = unreal.EditorAssetLibrary.list_assets(folder, recursive=True, include_folder=False)
    records = []
    for path in paths:
        asset = unreal.EditorAssetLibrary.load_asset(path)
        if asset is None or not isinstance(asset, unreal.AnimSequence):
            continue
        skeleton = safe_call(asset, "get_skeleton")
        duration = safe_call(asset, "get_play_length")
        records.append({
            "path": path,
            "skeleton": skeleton.get_name() if skeleton else None,
            "seconds": duration,
            "root_motion": safe_property(asset, "enable_root_motion"),
        })
    result = evaluate(records)
    result["unreal_editor_version"] = str(unreal.SystemLibrary.get_engine_version())
    result["folder"] = folder
    result["timestamp_utc"] = datetime.now(timezone.utc).isoformat()
    destination = os.path.join(unreal.Paths.project_saved_dir(), "AnimationAudit")
    os.makedirs(destination, exist_ok=True)
    output_path = os.path.join(destination, "animation_audit.json")
    with open(output_path, "w", encoding="utf-8") as stream:
        json.dump({"results": result, "assets": records}, stream, indent=2)
    unreal.log("Animation audit saved: " + output_path)
    for warning in result["warnings"]:
        unreal.log_warning(str(warning))
    return result

if __name__ == "__main__":
    run()