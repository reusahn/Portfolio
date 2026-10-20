# Technical Game Designer — Final Portfolio Target Review

**Project:** thatgamecompany / Technical Game Designer, remote US/Canada
**Portfolio target:** https://jonghoonahn.com/thatgamecompany-final-target.html
**Current public page:** https://jonghoonahn.com/thatgamecompany-game-design.html
**Review assumption:** every proposed feature, game, tool, release and test in the target portfolio has actually been developed, documented and shown in genuine source/video.

## The hiring-manager recommendation

**12 case studies in 6 categories, with 3 hiring-critical products at the center.**

1. **Windward** — a compelling playable asymmetric online co-op, distinct from a shared joystick. Player decision, movement, failure recovery, state replication and clear emotional feedback are all real systems.
2. **Encounter Studio + Adaptive Camera Director** — demonstrates the full loop: designer requests a feature → developer codes it → tests it in the game → exposes it as reusable content-authoring capabilities. Use Cinemachine, do not re-implement it.
3. **Windward Live Operations** — distinct documented operating case for the *same* game, including session events, versioned updates, a reproduced bug and genuine patch cycle. Not a fabricated commercial LiveOps job.

A fourth technical showcase, **Quiet Guardian**, makes full use of Maya/rigging and procedural motion while covering creature AI that was explicitly mentioned in the posting. It should be a feature within Windward, not a second unrelated game.

The six areas and 12 cards:
- 01 Gameplay & game feel: Windward / Responsive Game Systems (Erick Oh)
- 02 Designer tools & camera features: Encounter Studio / Adaptive Camera Director
- 03 Multiplayer & live operations: Windward Live Operations / Jemulpo Photo Studio
- 04 AI creatures, procedural animation & cloth: Quiet Guardian / Mobile Character Runtime
- 05 Visual scripting, Maya & animation: Blueprint Interaction Systems / Maya Character Pipeline
- 06 NPC interactions and immersive play: Escape Metro / Graffiti Freedom

NARCI / Be NARCI remains reachable as additional VR work, but it does not take a core hiring-case card.

## Hypothetical completed-portfolio scorecard (not current readiness)

These weights are an assessment framework, not the employer's official rubric:

| Category | Weight | What would satisfy a 10/10 final presentation |
|---|---:|---|
| Gameplay design + C# implementation | 20 | Windward is fun in independent playtests, source reviewable, clear input/feedback and complete playable loop |
| Designer-facing tools + iteration | 20 | Another designer authors a new encounter and camera treatment without C# changes; actual Unity Editor demo |
| Multiplayer engineering | 15 | Two independent clients, authority, interpolation, lag and disconnect tests, no divergent win/fail |
| Live-game operations | 15 | Real accessible game sessions, versioned content release, genuine incident, patch and follow-up |
| AI, NPC, procedural motion + cloth | 10 | Player-driven creature behavior, IK and authored clips, prior Android cloth demonstration |
| Visual scripting + DCC/engines | 10 | Inspectable real Blueprint graph with interactive behavior; real Maya rig and assets |
| Feedback, expressive player feel | 5 | Before/after captures link player input to actual camera/VFX/audio tuning decisions |
| Collaboration and handoff | 5 | A designer/tester uses tooling; actual feedback changes documented and demonstrated |
| **Total** | **100** | **10/10 target only if the listed evidence exists and passes technical scrutiny** |

**Non-negotiable nuance:** a genuinely released solo live game shows some relevant live operations, but does not automatically demonstrate maintaining a commercial live-service with a large production team. The distinction must be candid during an interview.

## Why these additions, not more unrelated projects

- **Adaptive Camera Director:** the job description literally uses a new camera feature plus editor workflow as the exemplar week. A fully integrated, game-aware Cinemachine extension makes that example concrete. Simple follow/look-ahead sliders alone are insufficient.
- **Quiet Guardian:** AI creature + Maya rig + procedural gaze/foot placement + player-readable intent, combined in one playable situation. Better than a decorative technical animation reel.
- **Windward Live Operations:** required competency that is not established by Jemulpo's TCP portrait gallery. The operational history must be genuine, dated and reviewable.
- **Encounter Studio:** keeps art, code, and design collaboration linked to real reused content rather than a generic duplicate of Visual Scripting.

## Submission evidence — exact sequence for each flagship

### Windward: candidate plays for 60–90 seconds
1. First two-player encounter: each role moves independently.
2. Wind Resonance solves a situation that cannot be solved by holding one button.
3. Fail/retry and visual clarity work without UI exposition.
4. Camera and creature respond to the shared action.
5. A working Unity build and C# controller / authoritative state snippet accompany the footage.

### Encounter Studio: candidate acts as a tool-building teammate
1. In Unity Editor, select an existing encounter asset and duplicate it.
2. Modify its co-op threshold, hold time, world action and feedback profile.
3. Place/resize a trigger volume in Scene view and run the encounter.
4. Show the changed gameplay plus the rule evaluation/debug display.
5. Give the tool to a second designer/tester; show a genuine iteration from their feedback.

### Adaptive Camera Director: candidate demonstrates a feature request lifecycle
1. Before: a single follow camera hides the seed or a newly approaching creature.
2. New feature: an explicit shot-intent arbitrator using Cinemachine target framing.
3. In level editor: a designer adjusts priority, transition and zone boundaries.
4. After: same recorded input, clearer gameplay visibility, no disruptive camera jump.
5. Show actual code or a diagram precise enough to discuss Cinemachine responsibilities.

### Windward Live Operations: candidate demonstrates shipping discipline
1. A public or controlled live online session with build/version numbers.
2. One encountered defect (not staged as a real incident) with reproducible steps.
3. Diagnostic logs, a tested fix and a regression scenario.
4. New content or gameplay adjustment with release notes.
5. Real, dated patch announcement and replay footage. Do not invent player counts or telemetry.

### Quiet Guardian: candidate demonstrates AI + animation
1. Two different wind/player behavior inputs.
2. Observe→approach vs observe→retreat decisions with explainable thresholds.
3. Side-by-side game footage and state/rig visualization.
4. Maya/Animator/Animation Rigging integration, readable eye/head/feet targets.
5. State flicker, obstacle, ground alignment and reset test.

## Final technical interview risk items

- **C++:** job prefers C++, but C# satisfies the language alternative. Do not invent C++ engine experience. A credible C# technical code walk matters much more than writing buzzwords.
- **Unreal Blueprints:** an interactive event/state scene and a real node-graph walkthrough are stronger than showing only a Sequencer cinematic.
- **Live operations:** authentic ongoing operation should include player-impact, not only a private simulation.
- **Design rationale:** mechanics need documented reason and evidence from a playtest; “two player inputs” alone does not equal a compelling co-op game.
- **Scope:** 12 cards represent 8–9 past productions plus modular case studies from *one* new Windward game/tooling ecosystem; do not imply 12 independent shipped games.

## Output conventions

- Existing works remain described in truthful terms.
- New target-state cases retain a **TARGET PORTFOLIO** notice and clearly specified media/checkpoint slots.
- Do not remove target warnings until their Unity implementation and actual release evidence exist.
- Preserve old public job-specific page and unrelated `index.html`.
- A perfect-looking website does not guarantee an interview or an offer; its score is an internal objective, not an employer probability.
