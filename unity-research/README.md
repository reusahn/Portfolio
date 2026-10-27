# Jonghoon Ahn / Unity, media art & interaction

An expanded portfolio of 15 existing works. Each case connects its artistic question, personal implementation, system flow, development decisions, project media, and a proposed research direction.

## Read

- [All 15 works](https://jonghoonahn.com/unity-research/)
- [Four Eyes reading route](https://jonghoonahn.com/unity-research/xr.html)
- [HAX reading route](https://jonghoonahn.com/unity-research/human-ai.html)
- [Development approach](https://jonghoonahn.com/unity-research/approach.html)
- [Technical map](https://jonghoonahn.com/unity-research/systems.html)
- [Working with a lab / acceptance and handoff](https://jonghoonahn.com/unity-research/handoff.html)
- [Source and setup](https://jonghoonahn.com/unity-research/code.html)

## Four practices

| Practice | Works |
| --- | --- |
| Real-time graphics & environments | Algorithm of Flowers and Grammar of Waves, Beads Wall, Fall of Minds, Erick Oh |
| Sensing, bodies & image transformation | To Eternity, Jemulpo Photo Studio, Silhak Dance, Track 6 |
| Digital humans & conversational AI | AI Gang Se-hwang, AI ZOO, AI Choi Jung-hoon |
| VR worlds & critical interaction | Fineo, Escape Metro, NARCI / Be NARCI, Graffiti Freedom |

Every reading route retains all 15 works. The main route prioritizes XR, with direct implementation entry points for To Eternity, Erick Oh and Context Gate. Escape Metro / RedFlight is one project. NARCI / Be NARCI is one connected case. Unreal / MetaHuman work stays separate.

## Editorial source

Project descriptions: content/projects.json. Within the complete repository checkout, rebuild pages and project development notes with:

    python tools/build_portfolio.py

The generator retains the existing Context Gate and source pages. New development notes are retrospective design analyses. They are not recovered original production documents.

## Source prototype

Context Gate is a separate new research instrument. The [Unity source bundle](downloads/Unity_Research_Source.zip) contains independent samples, tests, tools, and setup notes. It contains no private production source.

Release context-gate-0.1.1 repairs journal-construction cleanup and the paused countdown in source. The Python event checker passes 66 synthetic fixture tests. The C# files, shader, scene generator, and Unity tests have not been compiled or executed in Unity. Browser-model checks do not verify Unity. No fabricated performance, participant result, clinical effect, professor endorsement, or funded vacancy is asserted.

## Documentation

- [Project development notes](docs/PROJECT_DEVELOPMENT_NOTES.md)
- [한국어 촬영 가이드](docs/EVIDENCE_CAPTURE_KO.md)
- [A–D 이전 가상 검토](docs/DESIGN_REVIEW_KO.md)
- [A·B·C 독립 검토와 실제 수정](docs/ABC_REVIEW_KO.md)
- [Artifact index](docs/ARTIFACT_INDEX.md)
- [Run acceptance record](docs/HANDOFF_CHECKLIST.md)
- [Event contract](docs/SESSION_SCHEMA.md)
- [Executed offline checks](verification/offline-checks.json)
- [Source manifest](downloads/source-manifest.json)
- [Sources and claims](docs/SOURCES_AND_CLAIMS.md)
- [Validation record](docs/VALIDATION.md)

Changes remain inside unity-research/. The existing home and company-specific pages are preserved.
