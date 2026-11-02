# Snail Games USA — Senior Technical Animator
## Two-reviewer quality gate (2026-11-01)

This is a self-review framework, not an assessment by Snail Games hiring staff. No quantified acceptance odds are inferred.

### Reviewer A: Recruiter / first-pass screen (100 possible)
| Criterion | Weight | Evidence now | Score |
|---|---:|---|---:|
| Location and U.S. authorization clear | 10 | California, permanent resident; no sponsorship | 10 |
| Candidate summary matched to technical animation | 15 | UE5 / MetaHuman / DCC / capture in hero and resume | 15 |
| Role-relevant portfolio accessible in first click | 15 | Dedicated site and four direct case pages | 15 |
| Credible senior-level project ownership | 20 | Shininho, ten-character Row, When It Seen technical handoff | 18 |
| Resume readable and ATS-friendly | 15 | One-page text-based PDF, conventional headings | 15 |
| Evidence links and media inspectable | 15 | Actual images and Vimeo sources, separate case links | 13 |
| Production skills and truthful scope | 10 | Strong MetaHuman; missing direct runtime animation demo clearly labeled | 9 |
| **Total** | **100** | | **95** |

### Reviewer B: Central Art Team / technical animation lead (100 possible)
| Criterion | Weight | Evidence now | Score |
|---|---:|---|---:|
| MetaHuman and real-person identity pipeline | 15 | Shininho / Row material | 15 |
| Retargeting, mocap, face/body integration | 15 | Shininho / When It Seen | 14 |
| Rigging, deformation and DCC-to-engine | 15 | Shininho / Gang Se-hwang | 14 |
| Production debugging and QA | 15 | Ten-character case, motion handoff; standalone preflight | 12 |
| Documentation and reproducible handoff | 10 | Step-by-step cases, Python source/tests, lab acceptance checklist | 8 |
| Runtime Animation Blueprint / Blend Space / Montage | 15 | Specification exists; actual editor build not validated | 2 |
| Runtime profiling, optimization and engine validation | 10 | Target acceptance criteria; no measured UE5 benchmark | 1 |
| Shipped UE5 game ownership | 5 | Existing real-time art installations, no shipping claim | 0 |
| **Total** | **100** | | **66** |

Scores above are illustrative internal criteria to identify missing evidence. They do **not** measure hiring probability, reviewer consensus, or professional capability.

## Addressing the last major gaps

### 1. An actual UE5 animation systems mini-project — required to strengthen B
Build one self-contained Unreal 5 project that another animator can use:
- A grounded MetaHuman plus one second skeleton.
- Imported FBX animation sequences with documented skeleton/retarget origin.
- Idle/Walk/Run Blend Space and a gameplay Animation Blueprint state machine.
- Upper-body gesture montage with a slot and masked layered blending.
- IK Rig + IK Retargeter demonstration with root-motion / foot-contact evaluation.
- Readable Blueprint graphs and a short editor/play video.

Acceptance: running PIE and inspecting AnimBP values should show input->transition->result; changing the animation set should not require rewriting the project.

### 2. Production-facing debugging evidence
Capture a real bug reproduction and fix (e.g. foot sliding, root offsets, transition pop, missing animation) with:
- Before / after video under identical camera and input.
- Root cause (not just a screenshot).
- Which asset, graph, or import setting changed.
- One regression test / failure mode.

### 3. Actual performance evidence
On a stated machine and Unreal version, capture a profiling session and measurable before/after impact, or baseline if no improvement is needed. Do not guess milliseconds or FPS.

### 4. Test a clean handoff
Have another animator or a fresh project install follow the README and change a character animation without assistance. Record blockers and update docs.

## Truthful scope for interviews
- Row: ten-character MetaHuman production and animation troubleshooting, not commercial UE5 gameplay shipping.
- Shininho: production MetaHuman and Sequencer performance / VR work, not verified live-state-machine authoring.
- When It Seen: sync and downstream Alembic handoff, not online runtime animation.
- Gang Se-hwang: custom facial animation and live Unity HDRP install, not Unreal Animation Blueprint.
- Preflight: independently authored manifest lint with seven executed tests, not FBX/deformation validation.

## Suggested presentation order
1. Shininho / Jooan (identity through moving Unreal character)
2. Row (scaled, reusable production process)
3. When It Seen (capture sync and pipeline handoff)
4. Systems lab (tool, contract, then the actual UE5 runtime prototype once executed)
5. Gang Se-hwang (deep facial rigging as cross-engine support)
