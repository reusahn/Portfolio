"""Validate Context Gate Unity logs. Browser-concept exports are intentionally rejected."""
import argparse
import csv
import json
from collections import Counter
from pathlib import Path

def require(value, message):
    if not value:
        raise ValueError(message)

def validate(events, allow_incomplete=False):
    require(bool(events), "No events found.")
    requests, states = {}, {}
    counts = Counter()
    previous_time = -1.0
    session_id = events[0]["sessionId"]
    exclusions = set()
    for i, event in enumerate(events):
        prefix = f"Event {i}"
        require(event.get("kind") != "browser-concept", "This validator accepts Unity logs only.")
        require(event["sequence"] == i, f"{prefix}: noncontiguous sequence")
        require(event["sessionId"] == session_id, f"{prefix}: mixed sessions")
        require(event["elapsedSeconds"] >= previous_time, f"{prefix}: monotonic clock moved backward")
        previous_time = event["elapsedSeconds"]
        name, epoch = event["eventName"], event["epoch"]
        positions = event["positions"]
        require(len(positions) in (0, 3), f"{prefix}: unexpected task dimensions")
        require(len(set(positions)) == len(positions), f"{prefix}: overlapping objects")
        require(all(isinstance(p, int) and 0 <= p < 6 for p in positions), f"{prefix}: invalid slot")
        counts[name] += 1
        if name == "trial_start":
            require(epoch not in states, f"{prefix}: repeated trial epoch")
            require(event["revision"] == 0, f"{prefix}: initial revision must be zero")
            states[epoch] = (positions[:], 0)
        elif epoch in states:
            old, revision = states[epoch]
            if name == "object_moved":
                token, source, destination = event["token"], event["from"], event["to"]
                require(0 <= token < 3 and old[token] == source, f"{prefix}: move source mismatch")
                require(0 <= destination < 6 and destination not in old, f"{prefix}: illegal move")
                new = old[:]
                new[token] = destination
                require(new == positions and event["revision"] == revision + 1, f"{prefix}: move snapshot mismatch")
                states[epoch] = (new, revision + 1)
            else:
                require(old == positions and event["revision"] == revision, f"{prefix}: unexplained state mutation")
        if name in ("trial_reset", "trial_paused") or event.get("providerFault", "None") != "None":
            exclusions.add((event["trialId"], epoch))
        request_id = event.get("requestId", "")
        key = (epoch, request_id)
        if name == "hint_requested":
            require(key not in requests, f"{prefix}: duplicate request")
            requests[key] = {"event": event, "status": "pending"}
        elif name in ("hint_received", "hint_displayed", "hint_discarded", "hint_timeout", "hint_cancelled", "provider_error"):
            require(key in requests, f"{prefix}: response without a request")
            request = requests[key]
            require(request["status"] not in ("closed",), f"{prefix}: request resolved more than once")
            if name in ("hint_received", "hint_displayed", "hint_discarded"):
                original = request["event"]
                require(all(event[k] == original[k] for k in ("token", "from", "to", "snapshotRevision")),
                        f"{prefix}: changed hint payload")
                token, source, destination = event["token"], event["from"], event["to"]
                applicable = int(0 <= token < len(positions) and positions[token] == source and destination not in positions)
                require(event["applicable"] == applicable, f"{prefix}: applicability label disagrees with board")
                if name == "hint_received":
                    require(request["status"] == "pending", f"{prefix}: duplicate receive")
                    request["status"] = "received"
                else:
                    require(request["status"] == "received", f"{prefix}: decision without receive")
                    if name == "hint_discarded":
                        require(event["policy"] == "Revalidate" and applicable == 0, f"{prefix}: invalid discard")
                    if name == "hint_displayed" and event["policy"] == "Revalidate":
                        require(applicable == 1, f"{prefix}: revalidation displayed an inapplicable hint")
                    if name == "hint_displayed" and not applicable:
                        counts["inapplicable_hints_displayed"] += 1
                    request["status"] = "closed"
            else:
                require(request["status"] == "pending", f"{prefix}: invalid request terminal state")
                request["status"] = "closed"
    complete = events[-1]["eventName"] == "session_end"
    if not allow_incomplete:
        require(complete, "Session is incomplete. Use --allow-incomplete for a recovered JSONL journal.")
        require(all(r["status"] == "closed" for r in requests.values()), "Session ended with an unresolved request.")
    return {"sessionId": session_id, "events": len(events), "complete": complete,
            "counts": dict(counts), "flagged_trial_epochs": [list(x) for x in sorted(exclusions)],
            "scope": "Unity application event consistency. No behavioral or display-onset validation."}

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
        with args.csv.open(encoding="utf-8-sig", newline="") as file:
            rows = list(csv.DictReader(file))
        require(len(rows) == len(events), "CSV and JSON event counts differ.")
        for i, (row, event) in enumerate(zip(rows, events)):
            require(int(row["sequence"]) == i, f"CSV row {i}: wrong sequence")
            for key in ("eventName", "requestId", "trialId", "policy", "reason"):
                require(row[key] == event.get(key, ""), f"CSV row {i}: {key} differs")
            require(abs(float(row["elapsedSeconds"]) - event["elapsedSeconds"]) < 1e-8, f"CSV row {i}: time differs")
            require(row["positions"] == ";".join(str(p) for p in event["positions"]), f"CSV row {i}: snapshot differs")
        result["csv_matches"] = True
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
