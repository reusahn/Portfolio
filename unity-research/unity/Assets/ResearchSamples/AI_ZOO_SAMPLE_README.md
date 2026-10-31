# AI ZOO affect router: independent example

This example is newly written for the portfolio. It is not the installation's original C# source or evidence of a verified hardware run. The actual project's archive documents a Unity digital human, ChatGPT API, ElevenLabs voice, Leap Motion, Arduino servos, and lighting. Jonghoon Ahn clarifies that visitor dialogue was typed with a phone-like keyboard.

## One possible integration boundary

1. The phone-like input submits a text turn. A separate Python/API adapter obtains the reply and a structured affect representation; it never exposes a model API key in a Unity build. The adapter validates and forwards only the affect JSON to `TryApplyTypedTurn`.
2. A Leap Motion adapter calibrates a gesture to a contact value in `[0,1]` and calls `ApplyHandContact`. This is a design sketch, not a claim about the production sensor threshold.
3. `IntentReady` publishes bounded motion, light, and voice *intent*. Separate output adapters can map the intent to a digital human, the supported voice API parameters, and Arduino motor commands. The motor adapter must independently enforce tested angle limits, link loss behavior, and a physical stop. No wiring or serial packet format is supplied here.
4. `ResetEncounter` clears accumulated affect between viewers.

Example structured input: `{"anger":0.72,"sadness":0.41,"fear":0.19,"despair":0.88}`. These values are illustrative controls, not a saved AI ZOO interaction, a psychological measure, or proof of AI emotion.

The mapping in this example is an authored interpretation of the project's anger, sadness, fear, and despair vocabulary. Its coefficients, timing, and reset are **new portfolio example choices**. They do not reconstruct original production values. A useful bench verification would feed fixed JSON and hand values into the component, inspect `MotionIntent`, then use hardware calibration and emergency stop procedures before connecting the three servos. Unity compilation, Leap input, TTS mapping, and Arduino output remain unverified for this independent example.
