# UE5 Animation Review — Real Build Instructions

**State:** Implementation-ready source. The editor graph assets and performance tests **are not yet created or verified**.

1. Open `Unreal/AnimBridge.uproject` in your installed UE5 version and compile the module. A matching C++ toolchain is required. If the project is opened with a different UE5 version, update any BuildSettings and APIs only after observing actual compiler errors.
2. Use a Third Person character or a simple `ACharacter` with `CharacterMovementComponent`. Import legitimately owned Idle / Walk / Run clips and one upper-body gesture as animation sequences under `/Game/AnimationReview/Animations`. Check skeleton, clip duration, and root-motion settings in Editor.
3. Create Blend Space 1D `BS_ReviewLocomotion`, axis `GroundSpeed` in cm/s: Idle 0, Walk 150, Run 330 (tune using measured animation stride). Create Animation Blueprint `ABP_ReviewCharacter` for your skeleton and select native `UAnimRuntimeBridgeInstance` as its parent class.
4. Add State Machine `SM_ReviewLocomotion` with Grounded and Air. Grounded evaluates `BS_ReviewLocomotion(GroundSpeed)`; transition to Air when `bIsFalling`, back when false. Add a real Falling sequence for final capture; placeholder poses must be identified.
5. Cache the locomotion pose. Create a Montage using slot `UpperBody`. Blend the slot over locomotion via `Layered Blend Per Bone` starting at the appropriate spine bone, so the lower body remains animated. Expose `TryPlayGesture` through a test input Blueprint.
6. Create IK Rig assets for source and target skeleton and an IK Retargeter. Use a second skeleton (optionally your MetaHuman, respecting asset licensing) and test locomotion, foot sliding, root trajectory and upper-body gesture. Record actual Retargeter and AnimGraph screenshots.
7. Test 0 → 150 → 350 → 300 → 150 → 0 cm/s, jump/land, montage interruption, retargeted target, a deliberately bad source import, and replacement of one clip from a fresh checkout.
8. For Editor asset audit enable Python Editor Script Plugin. Run `py "<project>/Content/Python/review_anim_assets.py"` inside Unreal Editor. Output: `Saved/AnimationAudit/animation_audit.json`. It is read-only and cannot detect deformation visually; inspect facial and foot contact by hand.
9. Record a 60–90 second **actual** PIE + Animation Blueprint debugger capture and `stat unit`, `stat anim` or Unreal Insights session with machine/engine/LOD documented. Never invent performance savings. Then publish both the editor result and its known issues.

## Review acceptance criteria
- Correct speed-driven transitions and no hysteresis flicker near thresholds.
- Gesture montage layered without freezing lower body; interruption/recovery is deterministic.
- IK mapping documented for second skeleton and visible correction of foot/root alignment.
- An invalid animation asset and the corresponding audit warning can be reproduced.
- Handoff README allows another animator to change a clip without private instructions.
- Real profiler measures and source-level test evidence are attached.

The independent core's 14 test assertions and offline editor-audit's 5 tests have passed. **None of the above UE Editor requirements should be marked completed until verified in UE5.**

Documentation references: Epic UE5 Animation Blueprints, State Machines, Blend Spaces, Animation Montages, Python Editor Scripting.