# Context Gate / research protocol draft

Status: proposed extension and authored Unity source prototype. No participant data. No effectiveness result. Unity runtime validation pending.

## One research question

Does withholding delayed spatial advice whose object-state preconditions no longer hold make it easier to resume a task, compared with displaying every well-formed reply?

The possible benefit is fewer misleading interruptions. The possible cost is reduced assistance availability. Both must be measured.

## Proposed contribution

A Unity harness that revalidates delayed placement hints against explicit object-state preconditions and records what was shown, discarded, or cancelled across paired, reproducible trials.

This is an engineering instrument with a proposed behavioral extension. It is not a proven novel HCI method, a replication of the IUI experiment, or a code extension to XARP.

## Research basis

- Luo, Caetano, Nargund, Höllerer, and Sra. How Users Perceive Mixed-Initiative AI: Attitudes Toward Assistance in Problem Solving. IUI 2026. https://arxiv.org/html/2602.01481v1
- Caetano and colleagues. XARP: A Human-First and Agent-Ready Extended Reality Toolkit in Python. EICS 2026. https://arxiv.org/html/2508.04108

The first paper motivates isolating assistance delivery while controlling provider quality. The second supplies a relevant XR systems context. Context Gate's current code is independent of both implementations.

## Present engineering task

Three objects occupy six unique slots. Each object has one fixed target. Empty buffer slots allow cycles to be resolved. The deterministic provider returns one move from a snapshot. Participants or the operator can continue moving before that delayed response is processed.

The toy task is chosen to expose exact source / destination predicates with a small, auditable state space. It is not intended to establish the validity of a spatial-cognition task or to reproduce natural 3D assembly difficulty.

## Conditions

1. DeliverAll: display a well-formed reply even if the advised move is no longer applicable.
2. Revalidate: display the same reply only if the object remains at its original source and the destination is empty.

All policies reject malformed payloads and cross-trial / cancelled requests. These are lifecycle rules, not the manipulated comparison.

Checking only an overall revision would discard valid advice after unrelated actions. The local predicate check is deliberately more selective. It still does not establish that an applicable move remains optimal, contextually desired, or semantically correct.

## Controls and instrumentation

- Same deterministic provider, snapshot-derived payload, task rules, request action, and configured delay.
- Paired board seeds within a session.
- Alternating AB/BA order, reversible between sessions. Seeds and initial positions are retained in the event trail. Initial positions are authoritative if random-number behavior differs across runtimes.
- Session configuration is copied at session start.
- Trials have an explicit timeout and request timeout.
- No extra model, speech synthesis, or multi-user network component is added because these introduce variation unrelated to the current delivery comparison.
- Logging includes delivery decisions, complete object positions, request identity, snapshot / current revisions, UTC, monotonic elapsed time, and Unity frame number.
- Pause, reset, fault injection, cancellation, and incomplete runs are recorded rather than silently removed.

## Engineering validation before a human study

Replay the same initial layout and movement sequence under each policy.

A. Unchanged board: both display applicable advice.
B. Suggested object moves: DeliverAll may display inapplicable advice, Revalidate discards it.
C. Destination becomes occupied: the same comparison applies.
D. Unrelated object moves: both should retain advice if the original move's predicates still hold.
E. Reset / pause / trial end: both cancel pending work.
F. Timeout / malformed response / storage failure: no silent progression and no fabricated successful trial.

These checks establish mechanism behavior. The expected logical outcome is not itself evidence of improved human experience.

## Proposed behavioral measures

- Primary candidate: time from response processing to the next successful placement after an eligible changed-context response. A full study must define eligibility before data collection.
- Guidance availability: displayed / received; withheld, cancelled, malformed, and timed-out requests reported separately.
- Inapplicable exposure: displayed hints with a failed predicate, using the event-time board.
- Task outcomes: completion, total time, and unsuccessful placement attempts.

For recovery times, trial end can censor the next action. Do not drop those observations or treat them as zero. A future analysis must specify how censoring and repeated observations within people / trials are handled.

## Later human study, if justified

Pilot task difficulty before selecting a sample size. The present matching task may have floor effects. A harder assembly task may require changing the provider and predicate model, then repeating the engineering validation.

Choose practice, condition assignment, task order, and learning-effect controls before recruiting. Reusing layouts improves engineering comparisons but can create memory effects. A human study may require matched but distinct task instances, not the identical-layout engineering schedule.

Collect only what the question requires. Any participant study follows the applicable institutional process. Do not describe the source harness as an approved study.

## Solo scope and stopping rule

The present scope is one task model, two delivery policies, one scripted provider, a desktop operator interface, explicit lifecycle behavior, and event export. No general-purpose agent, distributed XR platform, live model benchmark, or automatic inference of user intent.

Stop adding features once the engineering checks, logs, desktop build, and captured demonstration are reproducible. Add XR input only to investigate a question that requires it.

## Validation limit

Application timestamps are not physical stimulus-onset measurements. No synchronized eye tracking, EEG, hardware trigger, motion tracking, or Quest execution is implemented or claimed here. The supplied C# code, scene generator, and tests have not been run in Unity in this session.
