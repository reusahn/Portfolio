#!/usr/bin/env python3
"""Tests for the independent animation preflight manifest utility."""
import csv
import tempfile
import unittest
from pathlib import Path
from animation_preflight import FIELDS, check_rows, validate

BASE = {
    "asset_id": "char01_walk",
    "character": "char01",
    "skeleton": "SK_Mannequin",
    "fps": "30",
    "start_frame": "0",
    "end_frame": "120",
    "root_motion": "no",
    "face_track": "no",
    "status": "review",
}

class ManifestTests(unittest.TestCase):
    def test_valid_record(self):
        self.assertEqual(check_rows([dict(BASE)]), [])
    def test_repeated_id_is_caught(self):
        rows = [dict(BASE), dict(BASE)]
        self.assertTrue(any(i["reason"] == "Duplicate asset ID" for i in check_rows(rows)))
    def test_invalid_range_is_caught(self):
        row = dict(BASE, end_frame="-5")
        self.assertTrue(any(i["field"] == "frame_range" for i in check_rows([row])))
    def test_invalid_frame_rate_is_caught(self):
        row = dict(BASE, fps="300")
        self.assertTrue(any(i["field"] == "fps" for i in check_rows([row])))
    def test_missing_facial_track_value(self):
        row = dict(BASE, face_track="")
        self.assertTrue(any(i["field"] == "face_track" for i in check_rows([row])))
    def test_empty_manifest_is_rejected(self):
        self.assertTrue(check_rows([]))
    def test_csv_roundtrip(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "manifest.csv"
            with path.open("w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=FIELDS)
                writer.writeheader()
                writer.writerow(BASE)
            count, issues = validate(path)
            self.assertEqual(count, 1)
            self.assertEqual(issues, [])

if __name__ == "__main__":
    unittest.main()
