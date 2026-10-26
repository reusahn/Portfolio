# Validation record / expanded portfolio

26 October 2026. Website, source, and Unity execution are separate validation scopes.

## Website and content checks

- 25 HTML pages, including 15 existing-work case studies.
- All 15 projects appear in each of the three reading routes. No project is removed to change the reading order.
- 804 local references and 192 page fragments were checked against the generated files and the repository path snapshot. 13 repository-document targets were checked. No missing reference or structural HTML error was found.
- Every page has one H1. Image alt text, duplicate IDs, and balanced tags were checked.
- Each project has four system stages, three retrospective development decisions, a proposed comparison, and exact technical capture instructions.
- The canonical project descriptions are in content/projects.json. The user's latest implementation clarification has priority over older generalized descriptions.

## Browser checks actually performed

Desktop Chrome preview:
- The main page displays all 15 cards.
- Category filtering, search, reset, and the zero-results message work.
- Kinect v2 search returns Silhak Dance and Track 6.
- Raymarching search returns the Erick Oh collaboration.
- The Four Eyes route retains 15 works and starts with Fineo / VR.
- The HAX route retains 15 works and starts with AI ZOO / digital humans.
- Fineo's detailed page, concept, credit, and navigation were inspected.
- The technical systems table was inspected.
- Fineo and Gang Se-hwang's Vimeo embeds reached actual playback; they were paused after checking.

Responsive CSS:
- A 390px iframe was used to inspect the narrow layout. This is a CSS layout check, not a physical-device test.
- The usable document client width and scroll width were both 375px, with no horizontal document overflow.
- Searching Barracuda in that layout returns Jemulpo.

## Code checks actually performed

- The JavaScript task model passed 1,188 assertions across all 120 unique three-object layouts on six slots.
- The portfolio interaction script passed Node syntax checking.
- Python syntax checks passed for the sender, event validator, page generator, and website verifier.
- The page generator and website verifier were actually run in the current environment.
- The code bundle is built with Python zipfile; its archive integrity is checked before publication.

## Explicit limits

- No new C# file or shader was compiled or run in Unity.
- The scene generator, C# tests, Unity TCP receiver, and Unity event exports have not been runtime-verified.
- No desktop Unity binary, Quest build, tracked input, hardware timing, or performance comparison was produced.
- Browser checks do not establish Unity behavior.
- Video checks cover the two named embeds, not every archived clip.
- The 390px check is not an accessibility audit or actual mobile-device validation.
- Proposed research comparisons are not participant results or demonstrated clinical effects.

## Reproduce relevant checks

Within a complete repository checkout:

    python unity-research/tools/build_portfolio.py
    python unity-research/tools/verify_portfolio.py
    node unity-research/tools/check_browser_model.cjs

For the partial local checkout used during authoring, verify_portfolio.py additionally uses --known-paths with the repository path snapshot.

The existing home and company pages remain outside the mutation scope. Publication success is verified separately through the Pages deployment status.
