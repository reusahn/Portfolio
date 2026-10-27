# Jonghoon Ahn / Unity research source

Source release: context-gate-0.1.1. These are independently authored examples and one proposed research instrument. This archive contains no private project source or production media.

## Start here

1. Read docs/UNITY_SETUP.md for the target engine and scene-generation workflow.
2. Read docs/HANDOFF_CHECKLIST.md before claiming a completed run.
3. Inspect unity/Assets/ContextGate/Runtime for the task model, paired trial design, lifecycle and event journal.
4. Run `python tools/test_validate_session.py` to test the Python checker with synthetic fixtures.
5. After a real Unity run, use `python tools/validate_session.py /path/to/session.json --csv /path/to/events.csv`.

The Python tools use the standard library. They do not compile or execute Unity. The browser task model can be checked separately with `node tools/check_browser_model.cjs`. Its results do not establish C# parity.

## Contents and evidence

- SOURCE_MANIFEST.json lists the exact bytes, SHA-256 and origin of bundled files.
- docs/ARTIFACT_INDEX.md maps each example to its purpose and limits.
- docs/SESSION_SCHEMA.md describes the checker’s represented event contract.
- verification/validator-tests.txt and offline-checks.json record actual Python fixture checks.
- docs/CODE_REVIEW_NOTES.md describes the reviewed source repairs and their validation scope.

Context Gate and the C# examples have not been compiled or run in Unity in this authoring environment. Unity 2022.3 LTS is an authoring target, not a verified compatibility result. Context Gate uses primitive scene content. The independent ResponsiveField.shader targets URP. Quest input, live AI services, hardware synchronization, and participant findings are not supplied.

Original works and source examples remain separate. The current portfolio is https://jonghoonahn.com/unity-research/.
