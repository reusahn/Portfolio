"""Offline unit tests for review_anim_assets.evaluate()."""
import importlib.util
import unittest
from pathlib import Path
P = Path(__file__).resolve().parents[1] / "Unreal" / "Content" / "Python" / "review_anim_assets.py"
spec = importlib.util.spec_from_file_location("anim_editor_audit", P)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
class TestEditorAudit(unittest.TestCase):
    def test_empty_assets_is_not_success(self):
        self.assertFalse(module.evaluate([])["passed"])
    def test_valid_asset(self):
        self.assertTrue(module.evaluate([{"path":"A","skeleton":"SK_A","seconds":1.5,"root_motion":False}])["passed"])
    def test_missing_skeleton(self):
        self.assertFalse(module.evaluate([{"path":"A","skeleton":None,"seconds":1,"root_motion":False}])["passed"])
    def test_zero_duration(self):
        self.assertFalse(module.evaluate([{"path":"A","skeleton":"SK","seconds":0,"root_motion":False}])["passed"])
    def test_unreadable_root_motion(self):
        self.assertFalse(module.evaluate([{"path":"A","skeleton":"SK","seconds":1,"root_motion":None}])["passed"])
if __name__ == "__main__":
    unittest.main()