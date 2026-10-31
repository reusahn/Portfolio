# AI ZOO dialogue-to-actuation example

New portfolio source, prepared from the artist's description of AI ZOO. It is not a recovered copy of the 2024 installation code. API credentials, Leap Motion hardware, Unity compilation, ElevenLabs playback, and servo operation have not been verified here.

## Signal contract

The phone-like keyboard calls `submitTurn(text)`. The Unity component requests a Chat Completions reply. Its system instruction requires a spoken answer followed by a final line:

```text
Please stay here with me.
[[EMOTION|anger=9|happy=3|sadness=51|fear=78|despair=60]]
```

The five numbers are integer control values from 0 to 100. `parseReply` accepts only the final line in this order and rejects missing fields, extra material after it, incomplete model output, and values outside the range. It separates spoken text from the control line before adding the assistant reply to the next turn's conversation history.

The project selects anger, happiness, sadness, fear, and despair. The first four are common categories in emotional speech datasets such as RAVDESS. Despair is a project-specific expressive control for the work's confinement narrative, not a validated psychological measurement. Valence/arousal literature informs the idea of separating affective quality from activation; the numeric coefficients and motor/voice curves in this source are newly authored examples.

The score changes `MotorCue.speed`, `power`, `phase`, and `light`. `voiceSpeed` becomes a per-request ElevenLabs `voice_settings.speed` value (bounded 0.7–1.2). `voiceVolume` changes Unity's `AudioSource.volume`; it is not sent as a nonexistent ElevenLabs loudness parameter. `onLeapContact(0..1)` is a hook for a separately calibrated Leap Motion adapter and increases the example's fear channel. `onReply` can be connected in the Inspector to a text display or animation controller.

## Local setup

1. Add `AiZooAffectRouter.cs` to a Unity project. Attach the component to an active GameObject, assign an `AudioSource`, set an ElevenLabs voice ID, and connect the typed-chat UI to `submitTurn`. Optional UnityEvents expose displayed text, errors, and light intensity.
2. Launch the Editor or the local installation with `OPENAI_API_KEY` and `ELEVENLABS_API_KEY` in its process environment. Never bake keys into a distributed Unity build. The Chat Completions model is an Inspector field so the model can be changed. The source uses an illustrative default model.
3. Start `python ai_zoo_motor_relay.py` with no serial port for a no-motion HTTP dry run. For a calibrated Arduino bench, install pyserial, connect the matching sketch, then run `python ai_zoo_motor_relay.py --port YOUR_PORT`. The relay binds only to `127.0.0.1:8765`, validates JSON, and translates normalized values to the sketch's ASCII line protocol.
4. `AiZooSphereServo.ino` begins with `calibrated = false`. Set actual pin assignments, neutral angles, permitted min/max angles and external power arrangement with the physical rig disconnected or safely staged. Only then change it to true and test one motor at a time. The sketch constrains angles and returns to neutral within one second if valid cues stop.

The API-key lookup, audio decoding, HTTP relay, and physical wiring have not been exercised in this environment. Do not represent the example's coefficients, motor angles, speech values, or error behavior as measurements of the original installation. The original project's exact service settings and serial wiring need its source and bench records.
