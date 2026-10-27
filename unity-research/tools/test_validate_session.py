"""Synthetic event-contract tests. These fixtures are NOT Unity runtime exports."""
import copy
import csv
import json
import math
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from validate_session import FIELDS, validate, validate_csv


class Fixture:
    """Explicit synthetic event builder, not a simulation of the Unity runtime."""
    def __init__(self, policy="Revalidate"):
        self.events = []
        self.epoch = 0
        self.trial = ""
        self.policy = ""
        self.seed = -1
        self.positions = []
        self.revision = 0
        self.hint = None
        self.event("session_start")
        self.start_trial("trial-1", policy)

    def event(self, name, **updates):
        i = len(self.events)
        event = {"sessionId": "synthetic-fixture-not-a-unity-run", "trialId": self.trial,
                 "policy": self.policy, "utc": "2026-10-27T12:00:00.0000000Z", "eventName": name,
                 "requestId": "", "reason": "", "providerFault": "None", "sequence": i,
                 "frame": i, "epoch": self.epoch, "revision": self.revision,
                 "snapshotRevision": -1, "boardSeed": self.seed, "token": -1,
                 "from": -1, "to": -1, "applicable": -1,
                 "elapsedSeconds": i / 10, "positions": self.positions[:]}
        event.update(updates)
        self.events.append(copy.deepcopy(event))
        return self

    def start_trial(self, trial, policy="Revalidate", seed=7):
        self.epoch += 1
        self.trial, self.policy, self.seed = trial, policy, seed
        self.positions, self.revision = [3, 4, 5], 0
        return self.event("trial_start")

    def move(self, token, destination):
        source = self.positions[token]
        self.positions[token] = destination
        self.revision += 1
        return self.event("object_moved", token=token, to=destination, **{"from": source})

    def request(self, request_id="r1", token=0, destination=0, fault="None"):
        self.hint = {"requestId": request_id, "token": token, "from": self.positions[token],
                     "to": destination, "snapshotRevision": self.revision, "providerFault": fault}
        return self.event("hint_requested", **self.hint)

    def reply(self, name, **updates):
        values = dict(self.hint)
        values.update(updates)
        return self.event(name, **values)

    def end_trial(self, reason="trial_timeout"):
        return self.event("trial_end", reason=reason)

    def finish(self):
        self.end_trial()
        return self.event("session_end", reason="completed")

    def abort(self):
        return self.event("session_end", reason="aborted")


class PositiveContractTests(unittest.TestCase):
    def test_normal_multi_trial_session(self):
        f = Fixture().end_trial().start_trial("trial-2", "DeliverAll", 8).finish()
        result = validate(f.events)
        self.assertTrue(result["journal_closed"])
        self.assertTrue(result["run_completed"])
        self.assertEqual(2, result["trial_epochs"])

    def test_completed_task_requires_three_target_positions(self):
        f = Fixture().move(0, 0).move(1, 1).move(2, 2).end_trial("completed")
        f.event("session_end", reason="completed")
        self.assertTrue(validate(f.events)["run_completed"])

    def test_revalidate_display_and_clear(self):
        f = Fixture().request().reply("hint_received", applicable=1)
        f.reply("hint_displayed", applicable=1).move(0, 0)
        f.reply("hint_cleared", reason="user_move").finish()
        self.assertEqual(1, validate(f.events)["counts"]["hint_cleared"])

    def test_revalidate_discards_changed_source(self):
        f = Fixture().request().move(0, 0).reply("hint_received", applicable=0)
        f.reply("hint_discarded", applicable=0, reason="source_changed").finish()
        self.assertEqual(1, validate(f.events)["counts"]["hint_discarded"])

    def test_revalidate_discards_occupied_destination(self):
        f = Fixture().request().move(1, 0).reply("hint_received", applicable=0)
        f.reply("hint_discarded", applicable=0, reason="destination_occupied").finish()
        validate(f.events)

    def test_baseline_may_show_inapplicable_hint(self):
        f = Fixture("DeliverAll").request().move(0, 0).reply("hint_received", applicable=0)
        f.reply("hint_displayed", applicable=0).finish()
        self.assertEqual(1, validate(f.events)["counts"]["inapplicable_hints_displayed"])

    def test_unrelated_move_preserves_hint(self):
        f = Fixture().request().move(1, 1).reply("hint_received", applicable=1)
        f.reply("hint_displayed", applicable=1).finish()
        validate(f.events)

    def test_abort_running_with_cancelled_pending_request(self):
        f = Fixture().request().reply("hint_cancelled", reason="session_aborted").abort()
        result = validate(f.events)
        self.assertTrue(result["complete"])
        self.assertFalse(result["run_completed"])
        self.assertEqual("aborted", result["session_outcome"])

    def test_pause_resume_and_abort(self):
        f = Fixture().request().reply("hint_cancelled", reason="paused")
        f.event("trial_paused").event("trial_resumed").move(0, 0).abort()
        self.assertEqual([["trial-1", 1]], validate(f.events)["flagged_trial_epochs"])

    def test_abort_while_paused(self):
        f = Fixture().event("trial_paused").abort()
        self.assertFalse(validate(f.events)["run_completed"])

    def test_abort_between_trials(self):
        f = Fixture().end_trial().abort()
        self.assertEqual("aborted", validate(f.events)["session_outcome"])

    def test_reset_repeats_identity_and_layout_in_new_epoch(self):
        f = Fixture().request().move(1, 1).reply("hint_cancelled", reason="reset")
        f.event("trial_reset").start_trial("trial-1").finish()
        self.assertEqual(2, validate(f.events)["trial_epochs"])

    def test_reset_while_paused(self):
        f = Fixture().event("trial_paused").event("trial_reset").start_trial("trial-1").finish()
        validate(f.events)

    def test_timeout_fault_closes_request(self):
        f = Fixture().request(fault="Timeout").reply("hint_timeout", reason="request_deadline").finish()
        self.assertEqual(0, validate(f.events)["unresolved_requests"])

    def test_natural_request_timeout_with_no_injected_fault(self):
        f = Fixture().request().reply("hint_timeout", reason="request_deadline").finish()
        validate(f.events)

    def test_malformed_fault_may_have_mutated_destination(self):
        f = Fixture().request(fault="Malformed")
        f.reply("provider_error", to=999, reason="malformed_payload").finish()
        validate(f.events)

    def test_fault_terminates_recoverable_journal_with_pending_work(self):
        f = Fixture().request().event("session_fault", reason="IOException: synthetic failure")
        result = validate(f.events, allow_incomplete=True)
        self.assertFalse(result["journal_closed"])
        self.assertEqual("faulted", result["session_outcome"])
        self.assertEqual(1, result["unresolved_requests"])

    def test_pretrial_fault_can_be_recovered(self):
        f = Fixture()
        f.events = f.events[:1]
        f.epoch, f.trial, f.policy, f.seed, f.positions = 0, "", "", -1, []
        f.event("session_fault", reason="InvalidOperationException: synthetic failure")
        self.assertEqual("faulted", validate(f.events, True)["session_outcome"])

    def test_truncated_prefix_can_be_recovered(self):
        f = Fixture().request()
        result = validate(f.events, allow_incomplete=True)
        self.assertEqual("incomplete", result["session_outcome"])
        self.assertEqual(1, result["unresolved_requests"])

    def test_truncation_after_receive_preserves_unresolved_decision(self):
        f = Fixture().request().reply("hint_received", applicable=1)
        self.assertEqual(1, validate(f.events, True)["unresolved_requests"])

    def test_cli_json_jsonl_csv_parity(self):
        f = Fixture().finish()
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            json_file, jsonl_file, csv_file = root / "session.json", root / "events.jsonl", root / "events.csv"
            json_file.write_text(json.dumps({"kind": "synthetic-fixture", "events": f.events}))
            jsonl_file.write_text("\n".join(json.dumps(e) for e in f.events))
            write_csv(csv_file, f.events)
            for source in (json_file, jsonl_file):
                result = subprocess.run([sys.executable, str(Path(__file__).with_name("validate_session.py")), str(source), "--csv", str(csv_file)], capture_output=True, text=True, check=True)
                self.assertTrue(json.loads(result.stdout)["csv_matches"])


class NegativeContractTests(unittest.TestCase):
    def rejects(self, fixture, pattern=None):
        events = fixture.events if isinstance(fixture, Fixture) else fixture
        # Recovery relaxes only the missing tail, never prior integrity checks.
        for recover in (False, True):
            with self.subTest(allow_incomplete=recover):
                with self.assertRaisesRegex(ValueError, pattern or "."):
                    validate(events, allow_incomplete=recover)

    def test_unknown_epoch_regression_without_trial_start(self):
        f = Fixture().move(0, 0).abort()
        events = [f.events[0], f.events[2], f.events[3]]
        for i, event in enumerate(events):
            event["sequence"] = i
            event["epoch"] = 0 if i == 0 else 99
        self.rejects(events, "unknown or inactive trial epoch")

    def test_unknown_epoch_with_known_other_trial(self):
        f = Fixture().move(0, 0).abort()
        f.events[2]["epoch"] = 99
        self.rejects(f, "unknown or inactive trial epoch")

    def test_duplicate_session_start(self):
        f = Fixture().event("session_start")
        self.rejects(f, "duplicate session_start")

    def test_first_event_must_start_session(self):
        f = Fixture()
        f.events[0]["eventName"] = "object_moved"
        self.rejects(f, "First event")

    def test_action_after_session_end(self):
        self.rejects(Fixture().finish().move(0, 0), "terminal session")

    def test_action_after_session_fault(self):
        self.rejects(Fixture().event("session_fault", reason="synthetic").move(0, 0), "terminal session")

    def test_missing_required_fields(self):
        f = Fixture().finish()
        del f.events[1]["boardSeed"]
        self.rejects(f, "missing event fields")

    def test_nonfinite_clock(self):
        f = Fixture().finish()
        f.events[2]["elapsedSeconds"] = math.nan
        self.rejects(f, "invalid elapsed time")

    def test_clock_backward(self):
        f = Fixture().finish()
        f.events[2]["elapsedSeconds"] = 0
        self.rejects(f, "clock moved backward")

    def test_mixed_sessions(self):
        f = Fixture().finish()
        f.events[2]["sessionId"] = "different"
        self.rejects(f, "mixed or empty")

    def test_policy_changes_within_epoch(self):
        f = Fixture().move(0, 0).abort()
        f.events[2]["policy"] = "DeliverAll"
        self.rejects(f, "identity changed")

    def test_seed_changes_within_epoch(self):
        f = Fixture().move(0, 0).abort()
        f.events[2]["boardSeed"] = 999
        self.rejects(f, "identity changed")

    def test_trial_id_changes_within_epoch(self):
        f = Fixture().move(0, 0).abort()
        f.events[2]["trialId"] = "other"
        self.rejects(f, "identity changed")

    def test_overlapping_trial(self):
        self.rejects(Fixture().start_trial("trial-2"), "overlapping trial")

    def test_reused_epoch(self):
        f = Fixture().end_trial().start_trial("trial-2")
        f.events[-1]["epoch"] = 1
        self.rejects(f, "trial epoch")

    def test_duplicate_trial_without_reset(self):
        self.rejects(Fixture().end_trial().start_trial("trial-1"), "without reset")

    def test_reset_changes_initial_layout(self):
        f = Fixture().event("trial_reset").start_trial("trial-1")
        f.events[-1]["positions"] = [4, 3, 5]
        self.rejects(f, "reset changed")

    def test_reset_changes_identity(self):
        self.rejects(Fixture().event("trial_reset").start_trial("trial-2"), "reset changed")

    def test_move_while_paused(self):
        self.rejects(Fixture().event("trial_paused").move(0, 0), "move outside running")

    def test_request_between_trials(self):
        self.rejects(Fixture().end_trial().request(), "outside active trial")

    def test_resume_without_pause(self):
        self.rejects(Fixture().event("trial_resumed"), "without pause")

    def test_pause_without_cancelling_pending_request(self):
        self.rejects(Fixture().request().event("trial_paused"), "not cancelled")

    def test_trial_end_without_cancelling_pending_request(self):
        self.rejects(Fixture().request().end_trial(), "not cancelled")

    def test_completed_session_with_active_trial(self):
        self.rejects(Fixture().event("session_end", reason="completed"), "active trial")

    def test_unsolved_completed_trial(self):
        self.rejects(Fixture().end_trial("completed"), "unsolved")

    def test_duplicate_trial_end(self):
        self.rejects(Fixture().end_trial().end_trial(), "outside active trial")

    def test_aborted_journal_with_unresolved_request(self):
        self.rejects(Fixture().request().abort(), "unresolved request")

    def test_illegal_move_source(self):
        f = Fixture().move(0, 0)
        f.events[-1]["from"] = 4
        self.rejects(f, "source mismatch")

    def test_occupied_destination(self):
        self.rejects(Fixture().move(0, 4))

    def test_unexplained_board_mutation(self):
        f = Fixture().event("move_rejected")
        f.events[-1]["positions"] = [0, 4, 5]
        self.rejects(f, "unexplained state mutation")

    def test_wrong_move_revision(self):
        f = Fixture().move(0, 0)
        f.events[-1]["revision"] = 0
        self.rejects(f, "snapshot mismatch")

    def test_response_without_request(self):
        self.rejects(Fixture().event("hint_timeout", requestId="unknown"), "without a request")

    def test_overlapping_requests(self):
        self.rejects(Fixture().request("r1").request("r2"), "overlapping request")

    def test_display_without_receive(self):
        self.rejects(Fixture().request().reply("hint_displayed", applicable=1), "decision without receive")

    def test_action_between_receive_and_decision(self):
        self.rejects(Fixture().request().reply("hint_received", applicable=1).move(1, 1), "missing delivery decision")

    def test_changed_response_payload(self):
        self.rejects(Fixture().request().reply("hint_received", applicable=1, to=1), "changed hint payload")

    def test_duplicate_request_resolution(self):
        f = Fixture().request().reply("hint_timeout", reason="request_deadline")
        self.rejects(f.reply("hint_timeout", reason="request_deadline"), "more than once")

    def test_revalidate_cannot_display_inapplicable_hint(self):
        f = Fixture().request().move(0, 0).reply("hint_received", applicable=0)
        self.rejects(f.reply("hint_displayed", applicable=0), "inapplicable hint")

    def test_baseline_cannot_record_a_gate_discard(self):
        f = Fixture("DeliverAll").request().move(0, 0).reply("hint_received", applicable=0)
        self.rejects(f.reply("hint_discarded", applicable=0), "invalid discard")

    def test_applicability_label_must_match_board(self):
        self.rejects(Fixture().request().reply("hint_received", applicable=0), "disagrees with board")

    def test_visible_hint_requires_clear_after_move(self):
        f = Fixture().request().reply("hint_received", applicable=1).reply("hint_displayed", applicable=1).move(0, 0)
        self.rejects(f.finish(), "did not clear")

    def test_unknown_event(self):
        self.rejects(Fixture().event("pretend_success"), "unknown event name")

    def test_browser_concept_is_rejected(self):
        f = Fixture().finish()
        f.events[0]["kind"] = "browser-concept"
        self.rejects(f, "Browser-concept")

    def test_fault_requires_recovery_flag(self):
        f = Fixture().event("session_fault", reason="synthetic")
        with self.assertRaisesRegex(ValueError, "incomplete"):
            validate(f.events)

    def test_csv_mismatch_in_previously_unchecked_epoch(self):
        f = Fixture().finish()
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "events.csv"
            different = copy.deepcopy(f.events)
            different[1]["epoch"] = 99
            write_csv(path, different)
            with self.assertRaisesRegex(ValueError, "epoch differs"):
                validate_csv(path, f.events)


def write_csv(path, events):
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        for event in events:
            row = {key: event[key] for key in FIELDS}
            row["positions"] = ";".join(str(p) for p in row["positions"])
            writer.writerow(row)


if __name__ == "__main__":
    print("SYNTHETIC EVENT-CONTRACT FIXTURES ONLY. No Unity runtime exports or participant data.", flush=True)
    unittest.main(verbosity=2)
