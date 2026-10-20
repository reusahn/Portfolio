"""Reproducible synthetic game-signal anomaly baseline.

This is a transparent, rule-based benchmark for the PlayStation 2027
application portfolio. It is not a pretrained model, production game QA
system, or evidence of actual gameplay-video anomaly detection.

Run:
    python baseline.py --scenario stall --threshold 0.70 --context --out trace.csv
    python -m unittest discover -s playstation-2027/experiment -p "test_*.py"
"""
from __future__ import annotations

import argparse
import csv
import json
import math
from pathlib import Path
from typing import Any


class LCG:
    """32-bit linear congruential generator, matching the browser demo."""

    def __init__(self, seed: int = 2027) -> None:
        self.state = seed & 0xFFFFFFFF

    def next(self) -> float:
        self.state = (1664525 * self.state + 1013904223) & 0xFFFFFFFF
        return self.state / (2 ** 32)


def generate(
    scenario: str = "stall",
    noise: float = 0.20,
    threshold: float = 0.70,
    context: bool = False,
    seed: int = 2027,
) -> list[dict[str, Any]]:
    """Return 64 synthetic frames at 2 Hz, with deterministic ground truth."""
    if scenario not in {"stall", "spike", "reverse", "normal"}:
        raise ValueError("Invalid scenario")
    if not 0 <= noise <= 0.70:
        raise ValueError("Noise must be between 0 and 0.70")
    if not 0.1 <= threshold <= 2.5:
        raise ValueError("Threshold must be between 0.1 and 2.5")

    rng = LCG(seed)
    rows: list[dict[str, Any]] = []
    for frame in range(64):
        action = 0.56 + 0.18 * math.sin(frame * 0.23) + 0.09 * math.cos(frame * 0.53)
        boost = 8 <= frame <= 13
        bug = scenario != "normal" and 29 <= frame <= 35
        target = 1.75 * action + (1.15 if boost else 0.0)
        actual = target + (rng.next() - 0.5) * noise * 2
        if bug and scenario == "stall":
            actual = (rng.next() - 0.5) * noise * 0.25
        if bug and scenario == "spike":
            actual += 1.95
        if bug and scenario == "reverse":
            actual = -1.75 * action + (rng.next() - 0.5) * noise * 0.3
        expected = 1.75 * action + (1.15 if boost and context else 0.0)
        score = abs(actual - expected)
        rows.append(
            dict(
                frame=frame,
                action=action,
                measured_velocity=actual,
                expected_velocity=expected,
                intentional_boost=boost,
                bug_ground_truth=bug,
                anomaly_score=score,
                predicted_alarm=score > threshold,
            )
        )
    return rows


def evaluate(rows: list[dict[str, Any]]) -> dict[str, float | int | None]:
    """Frame-level metrics. Undefined precision/recall are returned as None."""
    tp = sum(1 for r in rows if r["bug_ground_truth"] and r["predicted_alarm"])
    fp = sum(1 for r in rows if not r["bug_ground_truth"] and r["predicted_alarm"])
    fn = sum(1 for r in rows if r["bug_ground_truth"] and not r["predicted_alarm"])
    tn = sum(1 for r in rows if not r["bug_ground_truth"] and not r["predicted_alarm"])
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = (
        2 * precision * recall / (precision + recall)
        if precision is not None and recall is not None and precision + recall
        else None
    )
    return dict(
        frames=len(rows),
        true_positive=tp,
        false_positive=fp,
        false_negative=fn,
        true_negative=tn,
        precision=precision,
        recall=recall,
        f1=f1,
    )


def save_csv(rows: list[dict[str, Any]], path: Path) -> None:
    if not rows:
        raise ValueError("Cannot export an empty trace")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=["stall", "spike", "reverse", "normal"], default="stall")
    parser.add_argument("--noise", type=float, default=0.20)
    parser.add_argument("--threshold", type=float, default=0.70)
    parser.add_argument("--context", action="store_true", help="Account for the legal speed boost")
    parser.add_argument("--seed", type=int, default=2027)
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()

    rows = generate(args.scenario, args.noise, args.threshold, args.context, args.seed)
    result = evaluate(rows)
    if args.out:
        save_csv(rows, args.out)
    print(json.dumps({"configuration": vars(args) | {"out": str(args.out) if args.out else None},
                      "metrics": result}, indent=2))


if __name__ == "__main__":
    main()
