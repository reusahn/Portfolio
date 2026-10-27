# A review: a research PI perspective grounded in public work

27 October 2026. This is a simulated editorial assessment. It is not a statement, score, endorsement, hiring decision, or funding commitment from Tobias Höllerer.

## What would make me want to start a conversation

“I can identify an interaction or rendering subsystem you built, inspect its boundaries, and imagine assigning you a bounded research implementation.”

The portfolio already establishes a broad artistic and technical practice. It currently makes the visitor do too much work to identify the strongest evidence of individual engineering ownership. Fifteen equally weighted research questions also weaken the one research question that the new instrument actually operationalizes.

## Five criteria, 100 possible points

| Criterion | Weight | Current score | A full-score condition |
|---|---:|---:|---|
| Specific relevance to the lab’s published systems work | 20 | 16 | Identify two bounded implementation contributions, link the exact primary-source motivation, and keep their status proposed. |
| Individual engineering ownership | 20 | 16 | Lead with cases that clearly distinguish what Jonghoon implemented from the collaborators’ work. Use a concrete subsystem and input-to-output verb. |
| Inspectable evidence | 20 | 11 | Direct links from the relevant claim to actual source, an existing video, and exact outstanding Editor/device captures. A source example is labeled independently authored. |
| Research judgement | 20 | 17 | One operationalized comparison, a baseline, a controlled variable, an outcome that does not assume benefit, and explicit external-validity limits. |
| A low-friction first collaboration | 20 | 12 | State the first bounded deliverable, integration boundary, dependencies, acceptance record, and what a lab member must supply. |
| **Portfolio assessment** | **100** | **72** | No automatic full score for adding more prose. |

This is an editorial rubric. Real Unity execution readiness is assessed separately below. The scores are judgement estimates, not measured probabilities of recruitment.

## Public research read

- Höllerer’s official profile explicitly includes experimental HCI systems, AR/VR and 3D interfaces, interactive visualization, real-time graphics, and multimodal computing.
- XARP v4, §§6.2 and 13.2, places device work in a Unity client. Executor mappings are configurable in the Editor. Its discussion identifies missing visual-effect and animation features, plus limits around fine-grained rendering and large image streams.
- SABER, §§3.2–3.3, uses Unity task/event control with behavioral, gaze, and EEG records. Application event codes and actual display onset are separately validated.

These motivate contributions. They do not establish that the lab has requested these changes or has an open funded position. The student information page invites research participation and does not specify a paid GSR opening.

## Two concrete contribution directions

### 1. Unity interaction and visual-feedback adapters

A bounded implementation proposal is to expose a small, explicit set of Unity-side interaction and shader parameters to a research task. Include a desktop inspection path, named state changes, parameter ranges, and a recovery path when an input disappears. XARP is a motivating integration context. No XARP compatibility or integration should be claimed until its actual current API is inspected and the integration is run.

Strongest existing cases: Erick Oh, To Eternity, NARCI. Fineo remains an important conceptual and collaborative case, but its exact personal implementation is less inspectable in the currently available evidence.

Suggested one-sentence copy:

> I build Unity interactions and visual-feedback systems that turn sensed input and task events into controllable scene changes.

This sentence belongs on a collaboration or implementation page. The user has explicitly asked for only “Unity-based projects” as the home heading.

### 2. A repeatable harness for asynchronous task feedback

Continue the existing Context Gate prototype. Do not add a second research prototype. The concrete problem is that an external response can arrive after a user changes the state it describes. Keep request identity, task epoch, response validity, and cancellation distinct. The current deterministic provider lets the comparison isolate delivery policy before adding a live model.

The current desktop/discrete task is an engineering harness. A claim about spatial behavior in XR requires an actual XR task and later evaluation. Its one-sentence contribution can remain:

> A Unity harness that revalidates delayed placement hints against explicit object-state preconditions and records the delivery decision across paired trials.

A useful first collaboration deliverable is a reviewed run of this harness with a documented event trace. A later integration may bind the same lifecycle to one lab task. That sequence is more credible than promising to improve the entire toolkit.

## Reading order and copy

The current first row, Fineo and NARCI, prioritizes an interesting world and a psychological concept. It underplays the most direct implementation evidence.

Preferred compact entry points, without creating extra portfolio projects:

1. To Eternity: sensing → Unity event → Timeline / live composition.
2. Erick Oh: C# parameter control → cloud shader / raymarched metaball output.
3. NARCI: tracked hands → runtime scene/material states.
4. Context Gate: source-only instrument → a controlled async-feedback comparison.

If the homepage must stay grouped with VR first, reorder that group to NARCI → Escape Metro → Fineo → Graffiti. Add a short “Inspect implementations” link row to To Eternity, Erick Oh, and Context Gate rather than a second promotional hero or duplicated cards. Keep all 15 unique cards and the two-column layout.

Suggested technical teasers:

- NARCI / Be NARCI: “Tracked hands drive scene and material changes in paired VR encounters.”
- Escape Metro: “GPT-based NPC dialogue connected to puzzle clues and progression.”
- To Eternity: “Azure Kinect input coordinates live archival imagery and Unity Timeline.”
- Erick Oh: “Cloud shaders and raymarched metaballs, controlled through C#.”

Keep conceptual depth in the detailed pages. Those first technical sentences should remain close to my role and the existing video. Avoid identical implementation headings on all cases.

## Real execution readiness, separately

The published validation record states that the new C# source, shaders, scene generator, tests, file export, and desktop/Quest runtime have not been executed in Unity. Browser tests establish only browser behavior. Original production source has not been audited.

Accordingly I cannot honestly give 100/100 for demonstrated research-system readiness now. Minimum evidence before awarding full execution credit:

1. A declared Unity version, platform, dependencies, and a clean import/compile record tied to a source revision.
2. A desktop run of Context Gate demonstrating applicable response, stale response under both policies, unrelated move, timeout, reset, pause, and abort.
3. The real exported JSONL/CSV/JSON from that run, checked by the provided validator. Preserve failure traces rather than editing them out.
4. At least one existing-work capture showing input, Inspector/state change, and Game-view output together.
5. A short independent handoff: another person can follow setup instructions and reproduce one expected trace. This is an acceptance criterion, not a claim that it happened.

For SABER-style precision, app-level timestamps are not physical display-onset or EEG synchronization evidence. That boundary should remain explicit.

## Conditions for final re-review

A final editorial score can rise after the root agent implements the concrete entry points, makes the two contribution offers reviewable, and supplies an acceptance checklist with clear evidence status. A real execution score should remain pending until the records above exist. Do not weaken the criteria simply to print three 100s.

## Primary URLs and retrieval references

- Official profile: https://sites.cs.ucsb.edu/~holl/ — turn12view0
- Publication list: https://sites.cs.ucsb.edu/~holl/publications.html — turn15view3
- Student information: https://ilab.cs.ucsb.edu/info — turn13view0
- XARP v4: https://arxiv.org/html/2508.04108 — turn12view2, turn13view1, turn13view2, turn15view1, turn15view2
- SABER: https://sites.cs.ucsb.edu/~holl/pubs/Bullock-2026-IEEEVR.pdf — turn12view3, turn16view1, turn16view2

Research-suggestion paragraphs are my inference from these sources. They are not the authors’ staffing plans.

## Publication-ready collaboration copy

### Proposed technical spike

**One Unity interaction, ready to inspect.**

Bind one task event to one visible scene change. Expose a small set of useful controls. Make input loss, reset, and late responses visible in the event trace.

**What I can bring**

Unity/C# implementation, sensor-to-scene mappings, HLSL and visual-feedback controls, and experience integrating real-time work for exhibitions and XR.

**What we would choose together**

One task-state contract, one target platform, and the conditions that make a run valid. Hardware timing requirements are a separate decision.

**Reviewable deliverables**

A minimal scene, named settings, an input adapter, a documented reset path, and an event trace with expected outcomes. Include setup instructions and a short recording of the same input, runtime state, and visible response.

**Acceptance gate**

A clean import compiles. One valid event produces the expected response. An input-loss or late-response case has an explicit outcome. Reset returns to a known state. The exported trace matches the recording.

**Research context**

XARP motivates the question of reusable Unity-side controls and lifecycle boundaries. This is a proposed technical spike. No XARP integration or compatibility is claimed.

### One line beneath existing project evidence

- To Eternity: “Reusable direction: an input adapter and explicit sequencing boundary for a sensor-driven research task.”
- Erick Oh: “Reusable direction: bounded shader parameters that a task can set, inspect, and record.”
- NARCI / Be NARCI: “Reusable direction: a tracked-hand event boundary with an explicit loss-and-recovery state.”

These are extension directions. They do not state that those original projects already included logging, formal recovery policies, or reusable adapters.

## Full-score publication gates after the proposed edits

For each of the five 20-point editorial criteria, award the remaining credit only when these are visible:

- Relevance: two explicit offers, each tied to a primary paper section and a documented existing skill.
- Ownership: the quick route leads to concrete input/control/output work and says exactly which role Jonghoon held.
- Evidence: a reviewer reaches existing media and public source in one action, and source-only/Unity-unverified status remains adjacent.
- Research judgement: Context Gate is the single proposed instrument; no unnecessary paper claim appears on every artistic case.
- Collaboration: the proposed first deliverable, interface contract, acceptance record, and requested lab input are all specified.

Meeting these can justify a high editorial score even while the independent execution review remains open. It cannot justify replacing “runtime pending” with “validated.”
