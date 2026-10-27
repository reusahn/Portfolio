# Validation record / 27 October 2026

Website, offline code checks, source inspection and Unity execution are separate scopes. This record supersedes the earlier 26 October counts and reading order.

## Website and content

- 26 HTML pages, including 15 existing-work case studies and the new handoff page.
- Every reading route retains all 15 unique works. The main / XR route starts with NARCI, then Escape Metro. The HAX route starts with AI ZOO.
- The site checker found 822 local references, 214 fragments and 17 repository-document references with no missing target, duplicate ID, malformed tag structure, missing image alt, or incorrect H1 count.
- All 15 implementation headings name a project-specific mechanism. Four priority cases include a concrete design decision, failure check, observable evidence and reuse boundary.
- The short home title and two-column catalog are retained. Compact links reach To Eternity, Erick Oh and Context Gate.
- Case development notes are retrospective analyses. Proposed diagnostic actions and research comparisons are not reported historical incidents or study results.

## Browser checks performed

Desktop Chrome preview:

- The home entry, implementation shortcuts and handoff page were opened.
- The handoff page’s three implementation entry points and input / ownership statements were inspected.
- To Eternity’s implementation anchor and four-part engineering review were inspected. Document width and scroll width were both 1348px.
- Previous checks of category filtering, search, reset and the zero-results message remain relevant because portfolio.js was unchanged in this revision. The HTML checker verified all routes and targets after rebuilding.

Narrow CSS layout:

- A 390px iframe showed the home entry with all 15 works and the new shortcuts.
- Its Working with a lab link opened the handoff page with both technical tables.
- The usable document width and scroll width were both 375px on the home and handoff pages. No horizontal document overflow was observed. Tables retain their own scroll containers.
- This is a CSS layout check, not a physical mobile-device test or a complete accessibility audit.

Existing media checks retained from 26 October:

- Fineo and Gang Se-hwang Vimeo embeds reached actual playback and were then paused.
- That check covers the two named embeds. It does not assert playback verification for every archived video.

## Offline checks actually performed

- The Python event validator passed 66 synthetic fixture tests: 21 positive and 45 negative cases. The actual test log, source hashes, runtime and scope are retained in verification/.
- Tests include unknown epochs, illegal moves, pause/reset, abort/fault, duplicate request resolutions, valid incomplete prefixes, CLI inputs and CSV field agreement.
- The previously executed JavaScript task-model check passed 1,188 assertions across all 120 unique three-object layouts on six slots. The JavaScript model was unchanged in this revision. This does not verify C# parity.
- The page generator, source packager and HTML/reference checker were executed.
- The packager checks archive integrity and recomputes every payload SHA-256 against the manifest. The ZIP has 30 entries, with 29 hashed payload files and the manifest itself.

## Source inspection repairs

- EventJournal initialization closes acquired writers when opening files or writing/flushing the CSV header fails. StreamWriter-construction failure also closes its FileStream.
- ExperimentRunner.SecondsLeft uses pausedAt while paused, correcting the intended operator countdown display.
- These C# changes were reviewed statically. No engine/compiler or injected Unity storage-failure result is claimed.

## Still pending

- New C# / shader compilation, authored Unity Edit Mode tests, scene generation, desktop build and real exported sessions.
- Actual reception by the Unity TCP example, Quest input/execution, sensor measurements and hardware timing.
- Independent clean import and a teammate’s reproduction using the runbook.
- Original-work Editor/Inspector captures specified in the case pages.
- No participant study, clinical effect, measured performance improvement, hardware synchronization, professor endorsement or funded vacancy is asserted.

The checker validates represented fields and transitions. It cannot authenticate the origin of a hand-authored JSON file or prove which trial schedule was actually executed.

## Reproduce from a complete repository checkout

    python unity-research/tools/build_portfolio.py
    python unity-research/tools/verify_portfolio.py
    python unity-research/tools/test_validate_session.py
    python unity-research/tools/package_source.py

For the partial authoring checkout, verify_portfolio.py uses --known-paths with the repository path snapshot. Source-bundle users should follow README.md, docs/UNITY_SETUP.md and docs/HANDOFF_CHECKLIST.md within that archive.

Publication is checked separately through the GitHub Pages deployment result. All tracked changes stay inside unity-research/. Existing home and company-specific pages are preserved.
