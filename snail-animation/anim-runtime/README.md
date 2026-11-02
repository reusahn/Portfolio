# UE5 Technical Animation Runtime Proof Kit

**Source-only UE5 implementation kit.** The deterministic C++ locomotion core compiled on a host compiler and passed 14 standalone checks. The portable part of the editor audit passed 5 Python unit tests. **UE5 C++ module / UAnimInstance / Editor Python / Animation Blueprint have not been compiled or executed in Unreal.**

## Included
- `Core/AnimRuntimeCore.h`: speed transition hysteresis, falling state, invalid input handling.
- `Tests/test_anim_runtime.cpp`: 14 C++ assertions (transition cycle, hysteresis, fall recovery, malformed inputs).
- `Unreal/`: starter UE5 module `AnimBridge` including native `UAnimRuntimeBridgeInstance` (exposes speed, air, acceleration and montage-call API to Blueprints).
- `Unreal/Content/Python/review_anim_assets.py`: read-only Unreal Editor animation sequence audit; produces JSON under Saved/AnimationAudit.
- `Tests/test_editor_audit.py`: 5 offline tests for portable audit rules.
- `Docs/UE5_SETUP.md`: build steps, required authored editor assets, retargeting, debugging, performance and handoff criteria.

## Offline verification
```bash
clang++ -std=c++17 -Wall -Wextra -Werror Tests/test_anim_runtime.cpp -o anim_runtime_tests
./anim_runtime_tests
python3 -m unittest discover -s Tests -p "test_*.py" -v
```
**Results obtained:** 14 C++ checks passed, 5 Python tests passed. This is not an Unreal runtime validation.

## Evidence rules
- Never describe `ABP_ReviewCharacter`, Blend Space, Montage, Control Rig, IK Retargeter or Quest profiling as completed unless the actual UE5 Editor data and captures exist.
- Newly authored sample: unrelated to private project source from Shininho, Row, When It Seen or Gang Se-hwang.
- The real production cases are at [Snail Technical Animation Portfolio](https://jonghoonahn.com/snail-animation/).

## Next action
Compile `Unreal/AnimBridge.uproject` in local UE5 and author test assets following Docs/UE5_SETUP.md. Record PIE + Animation Blueprint debugger + actual profiler results, then mark acceptance tests pass/fail.