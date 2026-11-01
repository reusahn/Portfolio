# RELAY / 02 — Unity two-player LAN gameplay prototype

**Status:** source authored, **not compiled or device-tested** in this environment (Unity Editor is not installed). This is an experimental Unity implementation alongside the separately working browser prototype, not evidence of Quest shipping or production-scale multiplayer.

## Gameplay
Two connected players control orthogonal axes of one reticle. Host = horizontal A/D, guest = vertical W/S. Hold the shared reticle on the teal signal for 0.25 seconds to score; the pink decoy resets the combo. One 60-second round. The server owns the score, timer, target, and player positions.

## Quick start
1. Open this folder in **Unity 6** (6000.x). Internet is required once to resolve packages. The pinned Netcode package is `com.unity.netcode.gameobjects@2.7.0`.
2. In Player settings choose **Active Input Handling: Both**, or legacy Input Manager, since this sample uses `Input.GetKey`.
3. After scripts import, run **RELAY 02 > Build Demo Scene** from Unity's top menu. This creates `Assets/Scenes/RelayArena.unity` and registers it in Build Settings.
4. Press **Play**, choose **HOST / PILOT A**. Make a desktop standalone build of the scene; run it as **CLIENT / PILOT B**, address `127.0.0.1` on the same machine or host's LAN IP on the same local network.
5. Hold A/D on host, W/S on guest. Compare Score/Combo/Timer/Reticle across both running processes.
6. Disconnect guest and verify host pauses; reconnect and verify a round can restart.

## Network architecture
- One **scene NetworkObject** with `RelayMatch` keeps session state in `NetworkVariable`s.
- Clients send a **vertical axis only**, via `[Rpc(SendTo.Server, RequireOwnership = false)]` every 50 ms.
- Server checks `SenderClientId` equals the selected guest, clamps input to [-1,1], updates all authoritative game state at a fixed **20 Hz** simulation cadence.
- Both machines visualize the replicated state; UI uses exponential smoothing on the received position. Smoothing is presentation only; no local scoring/prediction is implemented.
- Guest disconnect resets remote input to zero and pauses a running session. No reconnect token or persistent room system is implemented.
- Transport uses **direct LAN UDP**, **no NAT traversal**, dedicated server, Relay, matchmaking, lag compensation, or VR input mapping yet. Start with LAN for honest verification.

## Test matrix to execute in Unity before making claims
| Test | Required evidence | Status |
|---|---|---|
| Editor compilation and `Build Demo Scene` | Unity Console clean, scene committed | PENDING |
| Host+client handshake | Both displays connected on two processes | PENDING |
| Client axis authority | Guest W/S changes vertical position on host | PENDING |
| Shared hit and combo | Same score/timer on both | PENDING |
| Invalid client input | Non-guest RPC rejected, NaN or excess clamped | PENDING |
| Guest disconnect / rejoin | Host pauses and starts fresh round | PENDING |
| Packet delay/jitter | Test through network simulation tooling | PENDING |
| Quest headset performance | Quest build, measured CPU/GPU timings, refresh mode, memory | PENDING |

## Honest portfolio scope
Existing art/game installations are separate, completed historical projects. This newly authored sample is **LAN desktop networking source** with execution pending. It does **not** claim to provide a complete Quest VR game. To build a Quest version, add OpenXR + XR Interaction Toolkit, replace keyboard axis adapters with controller axes, build for Android/Quest, and record headset profiling and two-device playtest results.

See official Unity references: https://docs.unity3d.com/6000.0/Documentation/Manual/com.unity.netcode.gameobjects.html and https://docs.unity.com/en-us/mps-sdk/tutorials/build-your-first-session


See also [`VALIDATION.md`](VALIDATION.md) and [`QUEST_VALIDATION.md`](QUEST_VALIDATION.md) for scoped checks.
