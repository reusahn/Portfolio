# RELAY / 02 — implementation and verification record

**Author:** Jonghoon Ahn  
**Evidence date:** 2026-10-31 (portfolio iteration; environment timestamps may differ)  
**Status:** browser gameplay and same-origin client protocol tested; Unity/Quest not tested.

## Test harness

Test runner: Python + Playwright using locally installed Chromium. The test injects the full browser HTML directly and creates two independent `about:srcdoc` browser frames in the same browser origin. This reproduces the same-origin messaging interface used by two tabs, but is *not* an actual cross-device Internet networking test.

## Executed checks

| Check | Procedure | Result |
|---|---|---|
| Local player input | Start local practice, hold D, observe horizontal position | PASS |
| Gameplay scoring | Place visible target at reticle, hold for 0.25s, observe +100 | PASS |
| Two-client input | Independent host and guest frames, guest holds vertical input | PASS |
| State synchronization | Compare host and guest phase and axis positions | PASS |
| Host authority | Attempt guest-only score overwrite, wait for next host snapshot | PASS — overwritten |
| Disconnect handling | Guest closes same-origin channel during active round | PASS — host paused |
| Runtime errors | Collect Playwright pageerror events | PASS — zero exceptions |

These are small functional tests, not load tests, Quest frame-time measurements, or a claim about production multiplayer stability. Snapshot sends are scheduled at 50 ms intervals in code; actual delivery can be throttled by the browser, so no measured 20 Hz network throughput is claimed.

## Implemented browser architecture

Host runs the 60-second round and alone updates score, combo, target, timer, collision and resets. Guest sends its vertical input; host clamps input and sends snapshots. Presentation code smooths received coordinates. Same-origin demonstration uses BroadcastChannel; optional remote connection uses WebRTC offer/answer and DataChannel.

## Pending verification (mandatory before claiming full Unity/Quest support)

- Unity 6 Editor compilation and `RELAY 02 > Build Demo Scene` success
- Host Editor + standalone LAN client handshake, score sync, disconnect and resume
- Network simulation testing for jitter/loss and replication recovery
- Quest input using OpenXR + XR Interaction Toolkit
- Quest CPU/GPU frame profiler captures, frame target, draw calls and memory under an actual build
- WebRTC peer connection across two physical devices and NAT environments, TURN relay if needed

## Run the browser functional tests

From the prototype folder: `python test_relay.py` (requires `playwright` and a working Chromium binary; test script uses container path `/usr/bin/chromium`, adjust for your OS). Alternatively open the site in two browser tabs and use the Host/Join tab controls manually.

## Source provenance

This is newly authored portfolio prototype code. Independent Unity/Netcode source was **not** compiled in the execution environment; the code is deliberately presented as a starting point, not a verified Unity deliverable. The historical `Jemulpo Photo Studio` four-participant networked installation is a separate project with different transport and deployment requirements.
