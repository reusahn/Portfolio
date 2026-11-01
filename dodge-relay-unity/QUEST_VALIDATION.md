# RELAY / 02 — Quest VR adaptation & profiling checklist

**Status: proposed checks, no measured results.**

1. In Unity install OpenXR and XR Interaction Toolkit, activate Android Quest support, and replace the sample keyboard axes with tracked controller thumbstick axes or hand interaction input. Record controller mapping and calibration procedure.
2. Build on actual target Quest device; record Unity editor version, build identifier, headset model, refresh mode, graphics API and render scale.
3. Record CPU frame timing, GPU frame timing, rendered triangles, draw calls/batches, GC allocations, texture memory and peak memory **from device instrumentation**. Do not infer GPU timing from desktop Editor FPS.
4. Keep a fixed reproducible 60-second round, compare one local headset with two connected headsets. Record network quality, dropped snapshots, and the guest disconnect/reconnect behavior.
5. Choose one bottleneck based on the measured trace, make one change, then capture the same measured trace after the change; preserve before/after profiler evidence.
6. Record 30–60 second uncut footage: headset gameplay, input-to-feedback, host-client scoreboard on separate devices and profiler overlay.

**Target evidence for DLVR:** a real Android/Quest build, two-device netcode gameplay, reproducible profiler capture, and a concise architecture diagram. Nothing in this checklist is currently a verified performance claim.
