# thatgamecompany Technical Game Designer — 10/10 Target Portfolio

**Updated:** 2026-10-19
**Target-state portfolio (design preview):** https://jonghoonahn.com/thatgamecompany-final-target.html
**Current actual portfolio:** https://jonghoonahn.com/thatgamecompany-game-design.html
**Important:** “10/10” is the standard for a complete, defensible role-targeted body of work, *not* a factual employer score or guarantee of an interview. The target assumes real Unity builds, code reviews, gameplay tests, designer handoffs, and genuine release/incident records. Unfinished projects remain labelled.

## Hiring-lead decision

Retire the version where one Windward game occupied five of twelve project cards. It inflates project count and leaves independent gameplay-programming proof weak.

**Final target = 10 cards / 5 distinct disciplines.**

| Section | Case study 1 | Case study 2 | Hiring reason |
|---|---|---|---|
| 01 Playable games & programming | **Windward** | **Echo Relay** | Two independent playable systems: network co-op and deterministic time-offset puzzle |
| 02 Production gameplay systems | Erick Oh — Responsive Game Systems | Escape Metro | Prior C# / HLSL work + AI dialogue used to resolve a real puzzle |
| 03 Tools & visual scripting | **Encounter Studio** | Unreal Blueprint Interaction Systems | Designer-owned level authoring + existing visual scripting |
| 04 Networked deployment & interaction | Jemulpo Photo Studio | Graffiti Freedom | Real TCP/Unity visitor deployments and direct input→persistent world response |
| 05 Character & animation | Shininho/Gang — Maya Pipeline | Mobile Character Runtime | DCC, HumanIK, retargeting, Cloth/Animator, on-device delivery |

### One complete game with four **technical chapters**
The Windward case should link related engineering work as subcases, not misrepresent them as four other games:

1. **Networked Gameplay:** authoritative physics, independent owned inputs, two clients, interpolation, collisions, save/retry.
2. **Designer Authoring:** Encounter Studio, ScriptableObjects and EditorWindow, authoring new level rules without bespoke code.
3. **Camera & Creature:** Cinemachine-based gameplay framing, Quiet Guardian behavior and procedural character animation. See target details at `thatgamecompany-camera-director.html` and `thatgamecompany-quiet-guardian.html`.
4. **Live Operations:** genuinely available online sessions, versioned build/content, compatibility, logs, defects and patches. See `thatgamecompany-live-operations.html`.

This is why **the main list needs only 10 projects**, not 12 or 15. The underlying engineering evidence is still comprehensive.

### Independent game — Echo Relay
A single-player temporal-companion puzzle that does NOT share Windward's core technology or narrative premise. Record a player path, replay it as a ghost, create a time-offset cooperative condition that opens a door, navigate and finish.

- Existing: browser mechanics demo with recorded path, position interpolation, collision, gate/plate trigger, success/retry.
- Required Unity build: C# input recording (fixed ticks), ghost actor playback, deterministic trigger state, authored puzzle parameters, 3D scene, genuine playtest, final footage and source walkthrough.
- Page: https://jonghoonahn.com/thatgamecompany-echo-relay.html
- Why it matters: shows independent gameplay-code design, state-machine and level-system competence rather than only artistic rendering or a single cooperative network prototype.

### Designer tool — Encounter Studio
Do not implement a redundant new Cinemachine or general Visual Scripting clone. Build a specific tool solving production problems:
- Runtime C# encounter evaluator for owned input and canonical world state
- Designer-authored conditions, hold timers, world actions, feedback profiles
- Unity EditorWindow/ScriptableObject workflow with preview and validation
- Actual test where a second designer authors a new encounter without editing gameplay source
- Unity integration with existing Cinemachine/Animator/VFX systems
- Current browser rule preview is not equivalent to the Unity editor tool.

## Full job requirement coverage (what a completed 10/10 review *requires*)

| Job competence | Where hiring reviewer finds it | Acceptance artifact |
|---|---|---|
| 3D gameplay programming in C/C++/C# | Windward + Echo Relay | Actual C# project sources, playable builds, end-to-end logic |
| Rapid 3D prototypes and iteration | Two games + Erick Oh | Before/after player-feel playtests, design rationale |
| Visual scripting | Unreal Blueprint | Actual node graph and triggered gameplay/sequence |
| Multiplayer game development | Windward | Two physically independent clients, network session, authority & consistency tests |
| Online live-game operations | Windward operations chapter | Genuinely hosted playable build, real players/sessions, logs, versioned release, reproducible bug and patch |
| Maya/3D production | Shininho, Gang, Mobile | Maya wireframe/UV/HumanIK rig, animation and Unity/Unreal result |
| Camera feature + editor tools | Adaptive Camera chapter (inside Windward), Encounter Studio | Actual Unity/Cinemachine extension and no-code editor iteration by a designer |
| Procedural animation / cloth | Quiet Guardian chapter + Mobile Character Runtime | AI state + IK/gaze and Android runtime Cloth demo |
| AI creatures & NPC interaction | Quiet Guardian + Escape Metro | Behavior changes on player actions + conversational password puzzle |
| Expressive player feel | Windward, Erick Oh, Graffiti | Direct input→response recordings and actual feedback tuning |
| Collaboration, risk-taking | Encounter Studio + deployed works | Designer handoff & real feedback, documented decisions and changes |

**C++ preferred not compulsory:** original role accepts C/C#. No unverified C++ claim should be added.

## 90-second hiring review sequence

1. **Windward:** first 60 seconds show the actual *two-client game* and the non-trivial interdependence of Wind Resonance.
2. **Echo Relay:** 30 seconds show a completely different independent programming challenge—recorded actions, ghost replay, puzzle resolution.
3. **Encounter Studio:** reviewer can immediately see a designer changing an encounter in Unity Editor and the resulting gameplay without modifying C#.
4. From these three, reviewer opens detailed code, Unreal Blueprint, Maya and live-operations tabs to verify specialist requirements.

## Definitions of “completed”
- **Windward:** publicly/repeatably playable Unity network co-op with filmed two clients and consistent game state, human playtests, bugfixes.
- **Echo Relay:** playable Unity 3D puzzle with reproducible ghost replay, authored level and test revisions.
- **Encounter Studio:** functioning Unity Editor extension and another person's recorded use.
- **Adaptive Camera Director:** real Cinemachine-backed feature, editor handles, input-controlled before/after camera visibility.
- **Quiet Guardian:** actual reactive creature AI/animation, not a static cinematic render.
- **Live Ops:** real dated online releases and incident response, with player impact and credible version history; no fictitious telemetry.
- **Existing production projects:** each with role ownership, clean media, inspectable source/graph/rig visuals where permissible.

## Remaining non-portfolio risks
- A solo game's beta/patches still may not count as **commercial live-service ownership at studio scale**. A hiring lead may consider it a must-have gap even if all work is excellent.
- The applicant's ability to pass an actual C# gameplay test, discuss profiling and debugging, and communicate tradeoffs in English are evaluated independently of the website.
- Do not tell the user that this structure guarantees an offer or a numeric “10/10” from the employer.

## Safe publishing
- `thatgamecompany-final-target.html` is the proposed eventual finished layout; leave target-state disclosure until real implementation exists.
- `thatgamecompany-game-design.html` is the separately maintained current public submission page; do not silently migrate unbuilt claims.
- Do not modify unrelated `index.html`.
