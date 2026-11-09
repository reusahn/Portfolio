# One Scene, Many Truths — v0.1 Product + Creative Specification
**Status:** interactive offline authored prototype planned / no live generative AI claim. **Priority:** 1.

## Single sentence
**The event stays the same. The story changes.**
Audience re-edits a fixed café encounter through three characters' limited, emotionally charged perspectives, then compares interpretations to a common event ledger.

## Dramatic event — canonical facts only
- In a café in the late afternoon, two people are seated near a window.
- A sealed envelope rests on the table.
- One person places a hand over the envelope briefly.
- That person stands up and walks away.
- The other person stays at the table.
- The envelope remains where it was left.
**Do not encode** abandonment, urgent appointment, shame, intention, or blame as factual observations unless an explicit source demonstrates them.

## Three perspectives (interpretation — NOT authoritative facts)
**Friend:** 'They chose to leave me.' Shoot empty chair, door, negative space; sound of retreating footsteps; hesitate before reading the letter.
**Café worker:** 'Someone must be late.' Shoot clock, coat, traffic outside; quick cut rhythm; no access to actual reason.
**Person leaving:** 'I couldn't say it aloud.' Shoot trembling hand, unmoving envelope, slowed departure; this is a first-person claim within the fiction, not a universal factual ledger.

## User experience
1. Open with a visible film-strip timeline and concise cinematic mood.
2. Observe same 4–6 canonical beats.
3. Choose witness A/B/C; editing parameters shift montage sequence, onscreen caption, soundtrack motif and intensity.
4. Show what that witness **noticed**, **assumed**, and **could not know**.
5. Allow a small authorial choice (e.g. shot emphasis, evidence toggle, pace) and observe a changed framing.
6. Compare all viewpoints against immutable fact ledger and discover the limited information behind their certainty.
7. End with a short question for the visitor: 'What did you assume before you had evidence?'

## Model integration (P2, not present in initial offline cut)
Use a server endpoint to send a **public fictional event JSON** and selected perspective. Model returns only constrained edit directions and inferences:
```json
{
  "perspective": "friend",
  "shot_order": ["door", "chair", "envelope", "hand"],
  "emphasis": "absence",
  "caption": "They could have stayed.",
  "voiceover": "I thought the silence was an answer.",
  "inference": "The person left to avoid me.",
  "uncertainty": "Intent cannot be directly observed."
}
```
Validate enum, known shot IDs, caption length, safety, no new factual events, and disclose generated content. A human-edit fallback remains active for offline access.

## Technical design (P1)
- Static GitHub Pages site, no build step: HTML/CSS/JS + structured scene data.
- Accessibly labeled perspective buttons and controls; state derived from immutable event list.
- Clear **authored offline proof-of-concept** status; deterministic choices initially, not simulated AI.
- Storyboard-only first release is valid if clearly titled a storyboard; no fake film footage.
- Versioned copy and tests for all narrative constraints; no visitor input retained by default.

## Deliverables
- Playable responsive browser experience
- Event invariants file and test
- 60–90 second walkthrough video, only after recorded
- Storyboard + eventual real footage
- Editorial process comparison and actual audience observation notes
- OpenAI-focused case page with personal contribution, design reasoning, limits

## Key risks
Novelty: perspective editing exists in interactive cinema; innovation must be experienced, not just described. 
AI necessity: a static three-way switch is insufficient — make real model-driven editing choices in P2.
Ethics: never present fictional assumptions as AI-verified memory or factual intent.
Privacy: no visitor confession collection in this project; use fictional scripted content.

## 2026-11-04 — Bounded edit-plan contract (source added, integration pending)
A new `one-scene/edit-contract.mjs` validates proposed edit directions **without trusting model-generated facts or freeform scripts**. Accepted fields are exactly `perspective`, `shot_order` (four unique known shots), `caption_id` (from the chosen witness's approved authored captions), and `pace` (approved enum). The requested witness is independently checked. Rejected proposals return errors and do not reach the renderer. Successful plans contain the canonical fact ledger from `story.mjs`, never from the proposal.

**Scope warning:** this is a source-level validation boundary, **not a connected AI feature**. It cannot establish semantic truth for arbitrary generated language, so the model is not permitted to return arbitrary language in this phase. No API keys or visitor content are involved. `node tests.mjs` includes new positive and adversarial cases; execution has not yet been verified in this run.

## Editorial provenance rule (implemented in source, November 9)
Every shot now has a provenance classification: **observed** with references to canonical fact indices, or **context** with no factual claim. A visible label explains why clock/window inserts cannot establish a character's motives. This does not infer new events, and all descriptions remain human-authored. Source: `one-scene/evidence.mjs`. Browser QA remains pending.
