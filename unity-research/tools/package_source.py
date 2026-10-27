"""Package independent source with per-file identity. Python standard library only.

Run in the complete portfolio checkout. File identity is not runtime validation.
"""
import hashlib
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = [
    "UNITY_SETUP.md", "RESEARCH_PROTOCOL.md", "SESSION_SCHEMA.md",
    "HANDOFF_CHECKLIST.md", "CODE_REVIEW_NOTES.md", "VALIDATION.md",
    "ARTIFACT_INDEX.md",
]
TOOLS = ["validate_session.py", "test_validate_session.py", "send_portrait.py", "check_browser_model.cjs"]


def main():
    sources = {p.relative_to(ROOT).as_posix(): p for p in sorted((ROOT / "unity/Assets").rglob("*"))
               if p.is_file() and p.suffix in (".cs", ".shader", ".asmdef")}
    sources.update({"docs/" + name: ROOT / "docs" / name for name in DOCS})
    sources.update({"tools/" + name: ROOT / "tools" / name for name in TOOLS})
    sources.update({
        "README.md": ROOT / "docs/SOURCE_BUNDLE_README.md",
        "context-gate-model.js": ROOT / "context-gate-model.js",
        "verification/offline-checks.json": ROOT / "verification/offline-checks.json",
        "verification/validator-tests.txt": ROOT / "verification/validator-tests.txt",
    })
    data = {name: path.read_bytes() for name, path in sources.items()}
    manifest = {
        "schemaVersion": "1.0", "sourceRelease": "context-gate-0.1.1",
        "provenance": "Independent portfolio examples, documentation and one proposed research instrument. No private production source.",
        "unityStatus": "C# compilation, Unity tests, scene generation, desktop build and device execution pending.",
        "checks": "verification/offline-checks.json records Python synthetic fixture checks only.",
        "files": [{"path": name, "origin": sources[name].relative_to(ROOT).as_posix(),
                   "bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()}
                  for name, content in sorted(data.items())],
    }
    manifest_bytes = (json.dumps(manifest, indent=2) + "\n").encode()
    download = ROOT / "downloads"
    download.mkdir(exist_ok=True)
    (download / "source-manifest.json").write_bytes(manifest_bytes)
    archive = download / "Unity_Research_Source.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for name, content in sorted({**data, "SOURCE_MANIFEST.json": manifest_bytes}.items()):
            entry = zipfile.ZipInfo(name, (2026, 10, 27, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            bundle.writestr(entry, content)
    with zipfile.ZipFile(archive) as bundle:
        assert bundle.testzip() is None
        assert len(bundle.namelist()) == len(data) + 1
        for row in manifest["files"]:
            assert hashlib.sha256(bundle.read(row["path"])).hexdigest() == row["sha256"]
    print(json.dumps({"sourceRelease": manifest["sourceRelease"], "bundledFiles": len(data) + 1,
                      "bytes": archive.stat().st_size, "sha256": hashlib.sha256(archive.read_bytes()).hexdigest()}))


if __name__ == "__main__":
    main()
