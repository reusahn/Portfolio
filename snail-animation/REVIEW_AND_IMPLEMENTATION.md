# Snail Games — Senior Technical Animator: two-reviewer assessment

**Updated November 1, 2026.** The scores below are internal illustrative ratings, not actual Snail Games hiring staff scores or probabilities.

## A — Recruiter / first pass (95 / 100)
- Work authorization, California availability: 10 / 10
- Technical animation summary aligned to role: 15 / 15
- Role-specific portfolio: 15 / 15
- Credible technical production ownership: 18 / 20
- Resume structure and traceable skills: 15 / 15
- Videos and process evidence: 13 / 15
- Truthful engineering scope: 9 / 10

## B — Animation systems team lead (reassessed: 73 / 100)

| Category | Maximum | Now | What supports the score |
|---|---:|---:|---|
| MetaHuman reconstruction and character pipeline | 15 | 15 | Shininho, Row |
| Capture cleanup / retarget / body + face | 15 | 14 | Shininho, When It Seen |
| Rigging / deformation / DCC integration | 15 | 14 | Gang Se-hwang, Shininho |
| Production QA / debug / traceability | 15 | 13 | Ten-character pipeline, standalone preflight, host tests |
| Documentation and reusable handoff | 10 | 9 | Case studies, test programs, UE5 setup + acceptance |
| UE5 Animation Blueprint / state machine / montage in runtime | 15 | 7 | C++ UAnimInstance source, tested state core; no UE Editor build |
| UE5 profiling / memory / runtime measurement | 10 | 1 | Measurement protocol only, no capture |
| Shipped Unreal PC/console game ownership | 5 | 0 | Not established by source |
| **Total** | **100** | **73** | Current evidence-based mock review |

### What makes 90 plausible without inventing a shipped game
1. **UE5 compiled and playable animation Blueprint (+8):** Open the new project, compile UAnimRuntimeBridgeInstance, create and demonstrate a Blend Space, state machine, upper-body Montage and interrupted recovery. Capture Editor Debugger plus PIE, not screenshots of a design document. B runtime row becomes 15/15.
2. **Actual IK retarget before/after and asset ownership (+2):** Show MetaHuman IK Rig / IK Retargeter with foot and root issues identified, and validated asset pipeline. QA becomes 15/15.
3. **Measured optimization and stable performance (+7):** Record hardware, engine version, FPS, animation thread cost, GPU/CPU frame time under repeated conditions with a real before/after fix. Performance becomes 8/10.

**Target after those three verified additions: 90 / 100.** Those gains are conditional, not completed.

The newly added source kit has 14 host-compiled C++ checks and five independent Python audit rule tests passed. **Unreal Engine was not installed or run in the authoring environment**. Do not claim .uasset graphs were created or MetaHuman code executed.

## Files
- [Portfolio](https://jonghoonahn.com/snail-animation/)
- [Runtime C++ / editor QA case](https://jonghoonahn.com/snail-animation/runtime-bridge.html)
- [Source folder](https://github.com/reusahn/Portfolio/tree/gh-pages/snail-animation/anim-runtime)
- [UE5 setup and acceptance procedure](https://github.com/reusahn/Portfolio/blob/gh-pages/snail-animation/anim-runtime/Docs/UE5_SETUP.md)
