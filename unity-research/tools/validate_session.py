"""Check the Context Gate event contract. Passing is not proof of Unity provenance.

Synthetic fixtures exercise this checker. Only an actual retained Unity run can
verify that the Unity implementation emits conforming events.
"""
import argparse
import csv
import json
import math
from collections import Counter
from datetime import datetime
from pathlib import Path

STRING_FIELDS = ("sessionId", "trialId", "policy", "utc", "eventName", "requestId", "reason", "providerFault")
INT_FIELDS = ("sequence", "frame", "epoch", "revision", "snapshotRevision", "boardSeed", "token", "from", "to", "applicable")
FIELDS = STRING_FIELDS + INT_FIELDS + ("elapsedSeconds", "positions")
EVENTS = set("session_start trial_start object_moved move_rejected hint_requested request_rejected hint_received hint_displayed hint_discarded hint_timeout hint_cancelled provider_error hint_cleared trial_paused trial_resumed trial_reset trial_end session_end session_fault".split())
REPLIES = {"hint_received", "hint_displayed", "hint_discarded", "hint_timeout", "hint_cancelled", "provider_error"}


def require(value, message):
    if not value:
        raise ValueError(message)


def validate(events, allow_incomplete=False):
    require(isinstance(events, list) and bool(events), "No events found.")
    requests, states, identities = {}, {}, {}
    counts, exclusions = Counter(), set()
    previous_time, previous_frame = -1.0, -1
    session_id, active, last_epoch = None, None, 0
    mode, expected_reset, visible, must_clear = "new", None, None, False
    ended_reason = ""

    def unresolved():
        return [key for key, value in requests.items() if value["status"] != "closed"]

    for i, event in enumerate(events):
        prefix = f"Event {i}"
        require(isinstance(event, dict), f"{prefix}: event must be an object")
        require(event.get("kind") != "browser-concept", "Browser-concept data is not Unity evidence.")
        require(all(key in event for key in FIELDS), f"{prefix}: missing event fields")
        require(all(isinstance(event[key], str) for key in STRING_FIELDS), f"{prefix}: invalid string field")
        require(all(type(event[key]) is int for key in INT_FIELDS), f"{prefix}: invalid integer field")
        require(type(event["elapsedSeconds"]) in (int, float) and math.isfinite(event["elapsedSeconds"]), f"{prefix}: invalid elapsed time")
        require(event["sequence"] == i, f"{prefix}: noncontiguous sequence")
        require(event["elapsedSeconds"] >= previous_time and event["elapsedSeconds"] >= 0, f"{prefix}: monotonic clock moved backward")
        require(event["frame"] >= previous_frame and event["frame"] >= 0, f"{prefix}: frame moved backward")
        require(event["epoch"] >= 0 and event["revision"] >= 0 and event["snapshotRevision"] >= -1, f"{prefix}: invalid state counter")
        require(event["applicable"] in (-1, 0, 1), f"{prefix}: invalid applicability flag")
        require(event["providerFault"] in ("None", "Timeout", "Malformed"), f"{prefix}: unknown provider fault")
        try:
            utc = datetime.fromisoformat(event["utc"].replace("Z", "+00:00"))
            require(utc.tzinfo is not None, f"{prefix}: UTC timestamp lacks an offset")
        except (TypeError, ValueError) as error:
            raise ValueError(f"{prefix}: invalid UTC timestamp") from error
        previous_time, previous_frame = event["elapsedSeconds"], event["frame"]
        if session_id is None:
            session_id = event["sessionId"]
        require(bool(session_id) and event["sessionId"] == session_id, f"{prefix}: mixed or empty sessions")
        name, epoch, positions = event["eventName"], event["epoch"], event["positions"]
        require(name in EVENTS, f"{prefix}: unknown event name")
        require(isinstance(positions, list) and len(positions) in (0, 3), f"{prefix}: unexpected task dimensions")
        require(all(type(p) is int and 0 <= p < 6 for p in positions), f"{prefix}: invalid slot")
        require(len(set(positions)) == len(positions), f"{prefix}: overlapping objects")
        require(mode not in ("closed", "faulted"), f"{prefix}: event after terminal session state")
        if i == 0:
            require(name == "session_start", "First event must be session_start.")
        else:
            require(name != "session_start", f"{prefix}: duplicate session_start")
        if any(r["status"] == "received" for r in requests.values()):
            require(name in ("hint_displayed", "hint_discarded", "session_fault"), f"{prefix}: missing delivery decision")
        if must_clear:
            require(name in ("hint_cleared", "session_fault"), f"{prefix}: moved object did not clear visible hint")
        counts[name] += 1

        if name == "session_start":
            require(epoch == 0 and event["revision"] == 0 and positions == [] and event["trialId"] == "" and event["policy"] == "", f"{prefix}: invalid initial session state")
            mode = "between"
            continue

        if name == "trial_start":
            require(mode == "between" and active is None, f"{prefix}: overlapping trial")
            require(epoch == last_epoch + 1 and epoch not in states, f"{prefix}: repeated or noncontiguous trial epoch")
            require(event["revision"] == 0 and len(positions) == 3, f"{prefix}: invalid initial board")
            require(event["trialId"] and event["policy"] in ("DeliverAll", "Revalidate") and event["boardSeed"] >= 0, f"{prefix}: invalid trial identity")
            identity = (event["trialId"], event["policy"], event["boardSeed"])
            if expected_reset is not None:
                require(identity == expected_reset["identity"] and positions == expected_reset["initial"], f"{prefix}: reset changed trial or initial layout")
                expected_reset = None
            else:
                require(event["trialId"] not in identities, f"{prefix}: repeated trial without reset")
                identities[event["trialId"]] = identity
            states[epoch] = {"positions": positions[:], "revision": 0, "identity": identity, "initial": positions[:], "status": "running"}
            last_epoch, active, mode, visible = epoch, epoch, "running", None
            continue

        # Session faults can occur before the first trial. Every other noninitial
        # event must refer to an epoch actually introduced by trial_start.
        if epoch == 0 and name == "session_fault":
            require(not states and positions == [] and event["trialId"] == "" and event["policy"] == "", f"{prefix}: invalid pretrial fault")
        else:
            require(epoch in states and epoch == last_epoch, f"{prefix}: unknown or inactive trial epoch")
            state = states[epoch]
            require((event["trialId"], event["policy"], event["boardSeed"]) == state["identity"], f"{prefix}: trial identity changed")
            old, revision = state["positions"], state["revision"]
            if name == "object_moved":
                require(mode == "running" and active == epoch, f"{prefix}: move outside running trial")
                token, source, destination = event["token"], event["from"], event["to"]
                require(0 <= token < 3 and old[token] == source, f"{prefix}: move source mismatch")
                require(0 <= destination < 6 and destination not in old, f"{prefix}: illegal move")
                new = old[:]
                new[token] = destination
                require(new == positions and event["revision"] == revision + 1, f"{prefix}: move snapshot mismatch")
                state["positions"], state["revision"] = new, revision + 1
                must_clear = visible is not None
            else:
                require(old == positions and event["revision"] == revision, f"{prefix}: unexplained state mutation")

        if name in ("session_end", "session_fault"):
            if name == "session_fault":
                require(bool(event["reason"]), f"{prefix}: missing fault reason")
                mode, ended_reason, active, visible, must_clear = "faulted", "faulted", None, None, False
                continue
            require(event["reason"] in ("completed", "aborted"), f"{prefix}: unknown session end reason")
            require(not unresolved(), f"{prefix}: session ended with unresolved request")
            require(expected_reset is None, f"{prefix}: session ended during an unfinished reset")
            if event["reason"] == "completed":
                require(mode == "between" and active is None and bool(states), f"{prefix}: completed session still has an active trial")
            else:
                require(mode in ("running", "paused", "between") and bool(states), f"{prefix}: invalid abort state")
            mode, ended_reason, active, visible = "closed", event["reason"], None, None
            continue

        require(active == epoch and mode in ("running", "paused"), f"{prefix}: event outside active trial")
        if name in ("object_moved", "move_rejected", "request_rejected", "hint_requested", "hint_received", "hint_displayed", "hint_discarded", "hint_timeout", "provider_error", "hint_cleared"):
            require(mode == "running", f"{prefix}: action while paused")

        if name in ("trial_reset", "trial_paused") or event["providerFault"] != "None":
            exclusions.add((event["trialId"], epoch))
        request_id = event["requestId"]
        key = (epoch, request_id)
        if name == "hint_requested":
            require(request_id and all(k[1] != request_id for k in requests), f"{prefix}: duplicate or empty request ID")
            require(not unresolved(), f"{prefix}: overlapping request")
            token, source, destination = event["token"], event["from"], event["to"]
            require(0 <= token < 3 and positions[token] == source and 0 <= destination < 6 and destination not in positions, f"{prefix}: invalid requested hint")
            require(event["snapshotRevision"] == event["revision"], f"{prefix}: request snapshot revision mismatch")
            requests[key] = {"event": event, "status": "pending"}
        elif name in REPLIES:
            require(key in requests, f"{prefix}: response without a request")
            request = requests[key]
            require(request["status"] != "closed", f"{prefix}: request resolved more than once")
            original = request["event"]
            if name in ("hint_received", "hint_displayed", "hint_discarded"):
                require(all(event[k] == original[k] for k in ("token", "from", "to", "snapshotRevision")), f"{prefix}: changed hint payload")
                token, source, destination = event["token"], event["from"], event["to"]
                applicable = int(0 <= token < 3 and positions[token] == source and destination not in positions)
                require(event["applicable"] == applicable, f"{prefix}: applicability label disagrees with board")
                if name == "hint_received":
                    require(request["status"] == "pending", f"{prefix}: duplicate receive")
                    request["status"] = "received"
                else:
                    require(request["status"] == "received", f"{prefix}: decision without receive")
                    if name == "hint_discarded":
                        require(event["policy"] == "Revalidate" and applicable == 0, f"{prefix}: invalid discard")
                    if name == "hint_displayed":
                        require(event["policy"] != "Revalidate" or applicable == 1, f"{prefix}: revalidation displayed inapplicable hint")
                        visible = event
                        if not applicable:
                            counts["inapplicable_hints_displayed"] += 1
                    request["status"] = "closed"
            else:
                require(request["status"] == "pending", f"{prefix}: invalid request terminal state")
                if name == "provider_error":
                    require(original["providerFault"] == event["providerFault"] == "Malformed" and event["reason"] == "malformed_payload", f"{prefix}: invalid malformed-response record")
                    require(all(event[k] == original[k] for k in ("token", "from", "snapshotRevision")), f"{prefix}: malformed response changed request identity")
                else:
                    require(all(event[k] == original[k] for k in ("token", "from", "to", "snapshotRevision", "providerFault")), f"{prefix}: terminal response changed request payload")
                request["status"] = "closed"
        elif name == "hint_cleared":
            require(visible is not None and request_id == visible["requestId"] and all(event[k] == visible[k] for k in ("token", "from", "to", "snapshotRevision")), f"{prefix}: clearing unknown visible hint")
            require(must_clear and event["reason"] == "user_move", f"{prefix}: invalid visible-hint clear")
            visible, must_clear = None, False
        elif name == "trial_paused":
            require(mode == "running" and not unresolved(), f"{prefix}: invalid pause or pending work not cancelled")
            mode, visible = "paused", None
        elif name == "trial_resumed":
            require(mode == "paused", f"{prefix}: resume without pause")
            mode = "running"
        elif name == "trial_reset":
            require(not unresolved(), f"{prefix}: reset with unresolved request")
            state["status"] = "reset"
            expected_reset = state
            mode, active, visible = "between", None, None
        elif name == "trial_end":
            require(mode == "running" and not unresolved(), f"{prefix}: invalid trial end or pending work not cancelled")
            require(event["reason"] in ("completed", "trial_timeout"), f"{prefix}: unknown trial end reason")
            if event["reason"] == "completed":
                require(positions == [0, 1, 2], f"{prefix}: completed trial is unsolved")
            state["status"] = "ended"
            mode, active, visible = "between", None, None

    journal_closed = mode == "closed"
    if not allow_incomplete:
        require(journal_closed, "Session journal is incomplete. Use --allow-incomplete for recovered JSONL.")
    return {"sessionId": session_id, "events": len(events), "complete": journal_closed,
            "journal_closed": journal_closed, "session_outcome": ended_reason or "incomplete",
            "run_completed": journal_closed and ended_reason == "completed", "trial_epochs": len(states),
            "unresolved_requests": len(unresolved()), "counts": dict(counts),
            "flagged_trial_epochs": [list(x) for x in sorted(exclusions)],
            "scope": "Event-contract consistency only. No Unity provenance, rendering, hardware timing, or behavioral validation."}


def validate_csv(path, events):
    with Path(path).open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        require(set(FIELDS) <= set(reader.fieldnames or []), "CSV is missing event fields.")
        rows = list(reader)
    require(len(rows) == len(events), "CSV and JSON event counts differ.")
    for i, (row, event) in enumerate(zip(rows, events)):
        for key in STRING_FIELDS:
            require(row[key] == event[key], f"CSV row {i}: {key} differs")
        for key in INT_FIELDS:
            require(int(row[key]) == event[key], f"CSV row {i}: {key} differs")
        require(math.isfinite(float(row["elapsedSeconds"])) and abs(float(row["elapsedSeconds"]) - event["elapsedSeconds"]) < 1e-8, f"CSV row {i}: time differs")
        require(row["positions"] == ";".join(str(p) for p in event["positions"]), f"CSV row {i}: snapshot differs")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("log", type=Path, help="session.json or events.jsonl")
    parser.add_argument("--csv", type=Path)
    parser.add_argument("--allow-incomplete", action="store_true")
    args = parser.parse_args()
    text = args.log.read_text(encoding="utf-8-sig")
    if args.log.suffix == ".jsonl":
        events = [json.loads(line) for line in text.splitlines() if line.strip()]
    else:
        report = json.loads(text)
        require(report.get("kind") != "browser-concept", "Browser-concept data is not Unity evidence.")
        events = report["events"]
    result = validate(events, args.allow_incomplete)
    if args.csv:
        validate_csv(args.csv, events)
        result["csv_matches"] = True
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
