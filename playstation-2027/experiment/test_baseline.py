"""Unit tests for the deterministic, explicitly synthetic anomaly baseline."""
import unittest

from baseline import evaluate, generate


class BaselineTests(unittest.TestCase):
    def test_trace_count_and_event_count(self):
        rows = generate("stall", context=True)
        self.assertEqual(len(rows), 64)
        self.assertEqual(sum(r["bug_ground_truth"] for r in rows), 7)

    def test_intentional_boost_is_normal_ground_truth(self):
        rows = generate("normal", context=False)
        self.assertEqual(sum(r["bug_ground_truth"] for r in rows), 0)
        self.assertTrue(all(not r["bug_ground_truth"] for r in rows[8:14]))

    def test_context_reduces_false_alarms(self):
        without = evaluate(generate("normal", context=False))
        with_context = evaluate(generate("normal", context=True))
        self.assertGreater(without["false_positive"], with_context["false_positive"])
        self.assertEqual(with_context["false_positive"], 0)

    def test_stall_is_detected(self):
        values = evaluate(generate("stall", context=True))
        self.assertEqual(values["true_positive"], 7)
        self.assertEqual(values["false_negative"], 0)

    def test_no_positive_recall_undefined(self):
        values = evaluate(generate("normal", context=True))
        self.assertIsNone(values["recall"])


if __name__ == "__main__":
    unittest.main()
