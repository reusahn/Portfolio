# thatgamecompany — Technical Game Designer Portfolio Media & Build Plan

**Portfolio:** https://jonghoonahn.com/thatgamecompany-game-design.html  
**Repository branch:** `reusahn/Portfolio` → `gh-pages`  
**Rule:** Main site `index.html` must remain untouched. Only role-specific pages and later-uploaded media should change.

## Application priority / review order

1. **Working two-client multiplayer proof — Windward.** This is the clearest uncovered must-have. Capture simultaneous two-PC or two-build multiplayer, authoritative shared seed physics, collision/retry, disconnect/rejoin, versioned update history.
2. **Unity camera tool and editor — FrameFlow.** Current browser camera sandbox works; build the corresponding Unity C# controller + ScriptableObject CameraProfile + scene gizmos/custom inspector and record a designer changing a level.
3. **Real C# / HLSL gameplay capture — Erick Oh game.** Existing implementation; 45–60 s input-to-visible-effect recording and C# shader-parameter binding / collision separation screenshots.
4. **Real Unreal Blueprint graph.** Existing documented Blueprint triggers/loops; insert actual readable graph screenshot and 20–40 s in-engine outcome.
5. **Gameplay/NPC footage — Escape Metro.** Show an actual player interrogation of the NPC, clue/password discovery and progression/escape along with Unity XR interaction and character response.
6. **Runtime cloth / APK — Mobile Character Runtime.** Record animation-state changes and live cape simulation on Android.
7. **Maya wireframe, HumanIK and UV — Shininho + Gang Se-hwang.** Current Maya process images already exist; add authentic HumanIK/rig setup and animation timeline views if available.
8. **Direct-feedback demos — Graffiti Freedom / NARCI.** Actual headset painting plus RenderTexture debug; hand-tracking input and its visual state change.
9. **Existing multi-user networked installation — Jemulpo Photo Studio.** Public deployment for up to 4 visitors in resume; existing public case documents TCP delivery to an exhibition wall. Add source/Unity captures for the sender/receiver, process boundaries and session/archiving behavior. Distinct from commercial online live-game operations.
10. **Deployed character application — Gang Se-hwang.** Retain as supplementary Maya/character/deployment case; not a main networked-game card.

## Ready-to-use case-study pages

| Portfolio card | Live HTML case page | Primary media to add |
| --- | --- | --- |
| Responsive Game Systems | `thatgamecompany-gameplay-system.html` | `erick_input_shader.mp4`, `erick_csharp_binding.png`, `erick_collision_debug.png` |
| Graffiti Freedom | `thatgamecompany-graffiti.html` | `graffiti_vr_paint.mp4`, `graffiti_rendertexture.png`, `graffiti_shader.png` |
| FrameFlow | `thatgamecompany-frameflow.html` | `frameflow_unity_runtime.mp4`, `frameflow_editor_tool.mp4`, `frameflow_profiles.png` |
| Blueprint Interaction Systems | `thatgamecompany-blueprint.html` | `blueprint_real_graph.png`, `blueprint_trigger_result.mp4` |
| Windward | `thatgamecompany-windward.html` | `windward_two_clients.mp4`, `windward_network_inspector.png`, `windward_patch_notes.png` |
| Jemulpo Photo Studio | `thatgamecompany-jemulpo.html` | `jemulpo_multivisitor_demo.mp4`, `jemulpo_tcp_receiver.png`, `jemulpo_archive_pipeline.png` |
| Public-Facing Unity Deployment (supplemental) | `thatgamecompany-live-installation.html` | `gang_visitor_interaction.mp4`, `gang_unity_scene.png` |
| Maya Character & Animation Pipeline | `thatgamecompany-maya-pipeline.html` | `shininho_humanik.png`, `shininho_animations.mp4`, `gang_maya_facial_rig.png` |
| Mobile Character Runtime | `thatgamecompany-character-runtime.html` | `mobile_cloth_android.mp4`, `mobile_unity_cloth_settings.png` |
| Escape Metro | `thatgamecompany-escape-metro.html` | `escape_metro_full_loop.mp4`, `escape_npc_pipeline.png` |
| NARCI / Be NARCI | `thatgamecompany-narci.html` | `narci_hand_tracking.mp4`, `narci_csharp_input.png` |

## Windward implementation milestones

**Stage 0 — done:** Local interactive browser controls / seed physics / obstacle contacts / failure & retry / destination in `thatgamecompany-windward-playtest.html`. This is *not* multiplayer. The game page now includes a proposed three-beat 90-second vertical slice: first updraft → alternating gap → shelter.

**Stage 1:** Unity scene with seed Rigidbody and colliders, GameManager (goal, fail, retry), 2 independent control sources, camera and shader feedback.

**Stage 2:** Unity Netcode for GameObjects or alternative network stack; session host + join; player roles and input ownership; server/host-authoritative seed physics; snapshot interpolation; reconnect/disconnect handling.

**Stage 3:** First complete obstacle passage. Test with two separate clients, observe latency, log collision/checkpoint divergence, retune feedback and forces. Record side-by-side capture.

**Stage 4:** Publish a versioned playable build, reproduce a specific bug, patch it, document before/after and keep release history. Only this creates *initial* evidence of operating the prototype online; it does not establish professional live-service-game experience.

## FrameFlow implementation milestones

**Stage 0 — done:** Browser-based camera parameter sandbox in `thatgamecompany-frameflow.html`.

**Stage 1:** Unity C# `FollowCameraController`, `CameraProfile` ScriptableObject and follow/offset/dead-zone/zoom controls.

**Stage 2:** Level-based `CameraZone` with profile priority and smooth transitions. Add authored test levels with moving player and occlusion.

**Stage 3:** Custom Inspector / SceneView handles. Record a designer modifying damping/framing without changing controller code.

**Stage 4:** Capture before/after results with identical input, include C# and editor screenshots and reproducible demo project.

## Media standards

- Video: MP4/H.264, 1080p, 16:9, with actual UI/gameplay visible. Avoid montage-only proof for technical systems.
- Capture a continuous, uncut input → state → feedback clip before producing a polished edit.
- Images: PNG or JPG, ideally >=1600 px wide for detail; screenshots must show legible graphs/Inspector/collision bounds.
- Keep proprietary/confidential material inside previously approved disclosure boundaries.
- For each project, specify **what you personally implemented** (especially in team-produced works) and what is only proposed.
- Upload media later under a consistent `assets/thatgamecompany/<slug>/` folder; change only the media slots of the relevant case page. Do not leave invented performance metrics.

## Final pre-application QA

- Two distinct client builds confirm actual remote co-op (not two windows pretending to be networked).
- Camera Editor extension has real source, inspector demo and designer walkthrough.
- Source screenshots are readable; no missing assets or unrelated thumbnails.
- Keep `index.html` and older site pages intact.
- Verify job requirements against the live posting again before submitting, including the employment / test requirements.
