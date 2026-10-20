# thatgamecompany Technical Game Designer | 10-Requirement Build Specification

Snapshot: 2026-10-19
Portfolio: https://jonghoonahn.com/thatgamecompany-game-design.html
Branch: reusahn/Portfolio / gh-pages
Purpose: record the systems to build, tests to pass, media to capture, and career claims to substantiate.
IMPORTANT: A completed design page is NOT proof of a shipped online game. Every incomplete requirement is labelled.

## Flagship 1: Windward — multiplayer cooperative game

Creative concept: Two players guide a fragile seed through shifting wind and encounters. Player A controls lift. Player B shapes horizontal airflow. Maintaining strong lift creates turbulence, so both players must coordinate to produce Wind Resonance: stable shared movement that unlocks a clear path. Player skill is communicated through the seed’s response, audio, wind ribbon, and environment, rather than a wall of text.

Playable scenario: the first updraft (discover complementary controls) → alternating obstacle passage (timing and corrective input) → resonance crossing (force coupling) → Quiet Guardian (restrained movement changes its response) → shelter and retry. Initial target: a 2–3 minute vertical slice, **not a claimed measured duration**.

Game systems to develop:
- Unity fixed-timestep SeedMotor, separate input channels, force coupling, gravity, drag and collisions.
- Network session / join / role selection, host-authoritative seed and encounter state, client interpolated presentation.
- Checkpoint state machine, retry, success and observed error transitions.
- Audio/VFX/shader/camera response driven from common normalized input and state, not independent gameplay calculations in each client.
- Designer-exposed wind force, resonance, obstacle, checkpoint and camera settings.
- Playtest comparison and release history. Record actual fixes and build versions; do not manufacture telemetry.

Current status: local *browser* seed-control demo exists; Unity network game / resonance / guardian extensions are not yet complete.
Live brief: https://jonghoonahn.com/thatgamecompany-windward.html

## Flagship 2: Encounter Studio — designer-facing tool

Why it exists: Unity provides Cinemachine and visual scripting already. Instead of cloning them, this tool offers a **game-specific authored co-op encounter workflow** that is reusable across levels.

Three designer presets:
1. Shared Gate: combined lift and steering satisfies a sustained condition; the gate opens and feedback plays.
2. Wind Bridge: stable collective airflow creates a traversable path.
3. Quiet Guardian: low disturbance invites a creature; harsh movement causes retreat.

Runtime/editor responsibilities:
- EncounterDefinition ScriptableObject serializes condition operands, timing, actions and feedback references.
- EncounterEvaluator reads canonical game state and dispatches one-shot transitions and resets.
- EncounterEditor EditorWindow previews conditions, volumes, missing references and current rule trace.
- Cinemachine / VFX / sound / Animator adapters consume rule events. Existing built-in packages own their specialist work.
- Network view displays authoritative rule transitions and two independent clients' observed state.

Current status: an **interactive browser rule preview** exists; Unity Editor extension and networking are planned.
Live brief: https://jonghoonahn.com/thatgamecompany-encounter-studio.html

## Ten requirement → portfolio → acceptance test

| # | Required or emphasized capability | Portfolio | What must be demonstrated |
|---|---|---|---|
| 1 | C# rapid 3D gameplay programming | Erick Oh + Windward | Inspectable C# source, scene and player input → state → response |
| 2 | Fluid controls and game feel | Graffiti + Windward | Real input recording and before/after visual/audio/camera feel |
| 3 | Technical systems enabling gameplay | Windward | Playable loop with failure, reset, checkpoint and design constraints |
| 4 | Designer pipeline / level editor tools | Encounter Studio | Unity EditorWindow, reusable assets, another designer tuning without code edits |
| 5 | Visual scripting | Unreal Blueprint | Readable REAL Blueprint node graph and captured event response |
| 6 | Multiplayer game development | Windward | Two independently connected clients, host authority, latency/disconnect test |
| 7 | Online operation of a live game | Jemulpo + Windward | Existing deployed TCP installation; for new game, actually run online sessions and publish a documented fix; note gap against full commercial LiveOps |
| 8 | Maya or 3D game engines | Maya Character Pipeline | Original Maya wireframe/UV/rig/HumanIK and real-time engine handoff |
| 9 | Procedural animation / cloth / AI creature | Mobile Character + Guardian | Existing Unity Cloth/Android footage; add procedural look-at, IK and creature states |
| 10 | NPC interaction / experimentation / iteration | Escape Metro + NARCI + Encounter Studio | Dialogue puzzle gameplay, interaction states, playtest changes and designer feedback |

C++ is preferred, C# is explicitly accepted. Do not imply shipped C++ gameplay if none exists.

## Engineering work order

### Milestone 1 — Local Unity game
- Implement two independent control sources and a shared physically simulated seed.
- Build one teach–challenge–complete level, collision/retry, resonance/turbulence and feedback.
- Record a genuinely runnable uncut gameplay session.

### Milestone 2 — Multiplayer
- Choose an identified Unity networking backend (e.g. Netcode for GameObjects + Relay/Lobby).
- Build and connect two separate clients.
- Run one authoritative seed simulation; verify identical goal and collision events.
- Test late input, 100ms injected latency, disconnection and restart; record actual measured results, not invented metrics.

### Milestone 3 — Encounter Studio Unity tool
- Create serializable co-op condition assets and an evaluator.
- Make an editor workflow that builds all three presets without custom per-level code.
- Attach effects to Cinemachine / shaders / audio and inspect rule/state trace.
- Capture the designer authoring a new encounter and seeing it run in Unity.

### Milestone 4 — Creature (only if core complete)
- Maya-prepared creature mesh / rig and base animation.
- Procedural head/eye aim and grounded stepping with Animation Rigging.
- Behavior states based on proximity, sudden gusts and stable wind.
- Compare different player behavior in one uninterrupted recording.

### Milestone 5 — Operational test and update
- Publish a versioned multiplayer build and instructions.
- Run several independent playtest sessions.
- Record bugs and usability observations; reproduce one issue.
- Ship v0.2 with patch notes and before/after footage.
- Distinguish demonstrated small-playtest operation from long-running commercial live-service ownership.

## Expected portfolio media

Windward: two-client side-by-side gameplay.mp4; seed authority/state inspector.png; fail/retry and patch.mp4; release notes.
Encounter Studio: real Unity EditorWindow screenshot.png; rule parameters and runtime effect.mp4; readable code screenshot; tester handoff.
Erick Oh: HLSL and C# binding code; direct input-to-feedback video.
Escape Metro: NPC question → clue/password → game progression clip.
Jemulpo: real TCP sender / wall-receiver image and gallery footage; do not imply online player-state replication.
Blueprint: real node graph and a play-mode event.
Maya: existing scan wireframe plus actual HumanIK/skin/UV capture.
Cloth: Android app and settings screen.
NARCI/Graffiti: short direct interaction sequences.

## Review gate
The portfolio may be designed for *all* requirements today, but cannot truthfully score 10/10 on demonstrated must-haves until a real Unity online build and repeatable designer-facing tooling exist. Preserve existing five grouped sections, ten two-column cards, minimal hero, and do not modify main index.html or restore the Main Portfolio link.
