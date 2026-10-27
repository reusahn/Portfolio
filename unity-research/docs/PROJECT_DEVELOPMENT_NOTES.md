# Project development notes

New editorial and pre-production notes for the expanded portfolio. These reconstruct the design logic of documented works. They are not recovered original planning documents. Research comparisons are proposals, not reported studies.

## Algorithm of Flowers and Grammar of Waves

**My role:** Artist / Unity developer

**Question:** How can a landscape retain the memory of an earlier state while its visible form keeps changing?

**Premise:** A landscape persists through change. Waves repeat, particles disperse, and a place returns without ever becoming the same image.

**Implementation:** I developed the particle imagery in Unity using VFX Graph and shaders. The work moves between recognizable landscapes and dispersed visual fields. The engine-side system becomes a moving-image series for the Art Korea Lab media wall.

### Development decisions

1. **Start from a visual relation.** Place repetition, growth, and disappearance in the same visual language. Decide which details make a place recognizable.
2. **Find the useful range.** Prepare variations in density and movement. Judge where a contour becomes unstable and where the source disappears completely.
3. **Compose a series.** Use the range of states to build transitions and differences between scenes, then assess the sequence at the scale of the wall.

### Input to output

Source imagery: Landscape and wave material | Graph / shader: Particle generation and visual treatment | Art direction: Density, movement, and dissolution | Presentation: A sequence for the media wall

### Proposed study

How does the persistence of a source contour affect recognition during particle-based transformation?

Vary: The degree and duration of contour preservation.

Hold consistent: The source sequence, viewing duration, and presentation scale.

### Evidence to add

- Show the VFX Graph, exposed properties, and Game view together. Change one parameter through the recognizable-to-dispersed range.
- Show a shader or graph contribution in isolation, then the combined result. Label any final rendered sequence separately from the live Unity view.

Scope note: VFX Graph and shader implementation are confirmed by the artist. No particle-count, performance, or interaction-effect claim is attached.

Project archive: https://jonghoonahn.com/detail_pages/flower-of-waves.html

## Beads Wall

**My role:** Artist / Unity developer

**Question:** What remains of a person's presence when a camera image becomes a field of discrete visual units?

**Premise:** A passing body can become an image without stopping to perform. The camera's view is redistributed into a field of small, luminous forms.

**Implementation:** I mapped live webcam imagery into a Unity VFX Graph system. The incoming image supplies the material for a bead-like visual field, making the relation between the camera, the moving person, and the display immediately visible.

### Development decisions

1. **Choose the encounter.** Begin with people passing through a camera's view rather than a formal start button.
2. **Set the mapping.** Compare the live source and its particle representation. Decide which image relationships should remain readable.
3. **Judge the display.** Assess recognition, scale, and movement from where a passerby actually sees the work.

### Input to output

Webcam: Live image input | Image mapping: Camera frame enters the visual system | VFX Graph: Bead-like particles and material behavior | Display: A changing image of the surrounding space

### Proposed study

How does image fragmentation change a visitor's recognition of their own movement?

Vary: Particle scale and the spatial resolution of the camera mapping.

Hold consistent: Camera position, live input, display size, and viewing distance.

### Evidence to add

- Record the webcam source, VFX Graph mapping, and final display at the same time.
- Move across the camera view and pause. Show which parts of the image update and how the bead field responds.

Scope note: This case uses the artist-confirmed webcam and VFX Graph scope. Azure Kinect and particular segmentation algorithms are not assumed.

Project archive: https://jonghoonahn.com/detail_pages/interactive_10.html

## Fall of Minds

**My role:** Coding director / artist

**Question:** Can an image make the collective activity of a space perceptible through its sound?

**Premise:** A shopping mall's ambient noise becomes a shared visual environment. The surrounding activity continuously changes the image.

**Implementation:** I developed a real-time visualizer that responds to ambient sound in the installation space. Live audio drives the behavior of a cascading, cloud-like visual form, connecting the public soundscape to the movement and density of the displayed image.

### Development decisions

1. **Listen to the site.** Define the acoustic setting and how quiet, ordinary, and busy conditions should differ visually.
2. **Choose the visual vocabulary.** Find a form that can change continuously as the public soundscape changes.
3. **Rehearse in context.** Check the relationship between the sound being heard and the image being seen at the actual installation scale.

### Input to output

Ambient sound: The venue's live acoustic input | Audio analysis: Sound becomes control data | Visual mapping: Control data changes the generative image | Public display: A continuously responding environment

### Proposed study

Which sound-to-image mappings make changes in collective activity easiest to perceive?

Vary: The visual parameter controlled by the same audio signal.

Hold consistent: Recorded sound input, display sequence length, and viewing conditions.

### Evidence to add

- Show the actual live audio input, the values used for control, and the visual output in one recording.
- Compare quiet and busy input without changing the visual configuration. Retain the actual mapping rather than assuming FFT or a particular feature set.

Scope note: The shopping-mall sound-reactive scope is confirmed by the artist. Older pages disagree on dates, so no single production year or unsupported audio algorithm is asserted here.

Project archive: https://jonghoonahn.com/detail_pages/media_3.html

## Erick Oh game collaboration

**My role:** Unity technical artist / developer

**Question:** How can a continuously changing visual form remain controllable enough for both art direction and interaction?

**Premise:** An artist's idea of a changing form becomes something a player can act on. Rendering and runtime behavior have to support the same expressive intent.

**Implementation:** I developed cloud-form shaders and a raymarched metaball implementation for droplet-like forms in Unity. C# controls connect interaction and runtime parameters to visual feedback. The archive also documents authored growth states prepared with consistent mesh topology.

### Development decisions

1. **Translate the direction.** Describe the behavior the artist wants to see, then separate shape, movement, and interaction requirements.
2. **Prototype the rendering approach.** Compare explicit mesh deformation with an implicit field according to the visual behavior each can express.
3. **Return to runtime control.** Expose the parameters that matter to direction and inspect the rendered response alongside the game state.

### Input to output

Interaction: Explicit C# runtime state | Visual control: Flow and transformation parameters | Rendering: Cloud deformation or a metaball field | Feedback: A responsive form in the game

### Proposed study

How do different visual deformation methods affect the legibility of an object's interactive state?

Vary: The visual representation used for the same state change.

Hold consistent: Input action, state transition, camera, and presentation timing.

### Evidence to add

- Record Game view, Transform, and shader control values while reversing the field direction and changing intensity.
- Show the droplet field and the separate contact or proximity logic. Identify the actual Maya growth states and their Unity controls.

### Engineering inspection

New review notes. Failure cases are proposed checks, not reported production incidents.

**Design decision:** Keep object motion, internal field flow, and authored growth as separate controls. The independent example integrates flow into shader phase and updates per-renderer parameters without moving the object.
**Failure case to exercise:** Reverse flow while holding the transform fixed. Raise displacement near the camera’s frustum edge. Inspect continuity and clipping. No captured result is reported for this check.
**Observable evidence:** Record Game view and Inspector together: flow reversal, maximum displacement, unchanged Transform, and renderer bounds. Keep the actual shader and controller revision with the recording.
**Reuse boundary:** The public example explains phase control and conservative bounds. It does not reproduce the production cloud shader or raymarched metaballs. It does not update colliders, shadow geometry, or displaced normals.

Scope note: The existing collaboration and public technical media are distinct from the independent shader example supplied below. No private production source or performance benchmark is included.

Project archive: https://jonghoonahn.com/projects7/erick-oh-real-time-graphics.html

## To Eternity

**My role:** Coding director / Unity developer

**Question:** How can a person enter an archive through a gesture rather than only look at it?

**Premise:** Remembrance becomes an embodied action. The visitor's live image carries archival photographs of the Gwangju Democratization Movement.

**Implementation:** I connected Azure Kinect sensing to Unity and integrated live interaction with Timeline-based media sequencing. Body input, archival-image composition, and timed presentation work together so the memorial responds to the participant rather than playing as a fixed video.

### Development decisions

1. **Define the commemorative act.** Use the relation between a body, a gesture, and archival imagery as the brief for the interaction.
2. **Map participation to sequence.** Decide which parts of the presentation are authored in time and which begin in response to live input.
3. **Rehearse the transitions.** Inspect arrival, recognition, image transformation, and return to a state ready for another participant.

### Input to output

Azure Kinect: Live body and depth input | Interaction state: Recognized participation becomes an event | Unity / Timeline: Media sequence and live composition | Projection: A memorial image shaped by presence

### Proposed study

How does gesture-triggered sequencing change the experience of participating in a digital memorial?

Vary: Gesture-triggered versus fixed-time presentation.

Hold consistent: Archival material, visual composition, and presentation duration.

### Evidence to add

- Show Azure Kinect input, the relevant Unity event, and the Timeline playhead in one recording.
- Record the participant-to-memorial transition and reset. Show the actual recognition rule without borrowing thresholds from an unverified older description.

### Engineering inspection

New review notes. Failure cases are proposed checks, not reported production incidents.

**Design decision:** Keep live sensor input distinct from authored Timeline time. The integration connects participant activity to a media sequence while preserving control over the composition.
**Failure case to exercise:** Leave the tracking area during a sequence and return. Inspect how the original project handles interrupted participation and prepares for the next visitor. Recovery behavior still needs a capture.
**Observable evidence:** Capture the Azure Kinect view, input-to-event boundary, and Timeline playhead in one continuous recording. Show the transition into the memorial image and the actual reset path.
**Reuse boundary:** This case demonstrates sensor-to-sequence integration. The recognition rule, sensor setup, and reset behavior must be documented before reuse. A reusable adapter and formal event logger would be additional work.

Scope note: Azure Kinect connection and Timeline integration are confirmed by the artist. No recognition-accuracy percentage or measured emotional effect is claimed.

Project archive: https://jonghoonahn.com/detail_pages/interactive_1.html

## Jemulpo Photo Studio

**My role:** Technical director / Unity developer

**Question:** What happens when a contemporary face is translated into the graphic conventions of a historical portrait?

**Premise:** A visitor's portrait enters the visual language of an earlier era. Image transformation becomes a way to inhabit a historical representation.

**Implementation:** I developed the Unity portrait pipeline using Barracuda-based AI processing, Python/OpenCV, style transformation, and visual filters. The system composes a processed portrait and connects it to archival output and an external display. The installation supports up to four simultaneous participants.

### Development decisions

1. **Choose the visual reference.** Identify the historical image conventions the participant should be able to enter.
2. **Separate the transformation stages.** Plan the relationship between model processing, image filtering, and the final portrait layout.
3. **Follow a portrait through the venue.** Rehearse capture, transformation, local output, and arrival on the public display as one visitor experience.

### Input to output

Portrait capture: A live visitor image | AI / image processing: Barracuda and OpenCV stages | Style / composition: Transformation, filters, and layout | Gallery output: Saved portrait and networked display

### Proposed study

How do different transformation layers affect recognition and identification with a historical portrait?

Vary: The contribution of style transformation and graphic filtering.

Hold consistent: Portrait input, target composition, and display conditions.

### Evidence to add

- Show the actual Barracuda model asset and processing stage, its input/output textures, the style or filter stage, and the final composition.
- Toggle the relevant processing layers for the same portrait. Separately record the capture-to-gallery path and actual participant routing.

### Engineering inspection

New review notes. Failure cases are proposed checks, not reported production incidents.

**Design decision:** Separate portrait transformation from transport. Barracuda, OpenCV, style processing, filters, and composition form the original image pipeline. The independent TCP example concerns complete-frame delivery to Unity’s main thread.
**Failure case to exercise:** For the independent receiver, split a PNG into small chunks, disconnect midway through a frame, and disable/re-enable while connected. Verify incomplete bytes never replace the displayed portrait.
**Observable evidence:** Show an original portrait through the actual transformation layers. Separately pair Python sender output with the independent Unity receiver’s status and displayed texture.
**Reuse boundary:** The public receiver is one-sender transport code. It excludes original inference, multi-participant routing, UDP, archival storage, and delivery acknowledgements.

Scope note: The artist confirms Barracuda, style transformation, filters, and the installation scope. Model architecture and its exact preprocessing contract are not inferred. The TCP sample below illustrates only a secondary process boundary.

Project archive: https://jonghoonahn.com/detail_pages/interactive_3.html

## Silhak Dance

**My role:** Technical artist / Unity developer

**Question:** Can moving with a historical character offer a different encounter from reading about one?

**Premise:** A historical scholar is encountered through a shared movement. The visitor meets the character by moving with it.

**Implementation:** I connected Kinect v2 body tracking to a Unity character interaction. The digital Kim Yuk follows the visitor's movement, bringing live body input and character animation into a museum presentation.

### Development decisions

1. **Begin with a shared action.** Frame movement as the way a visitor approaches the historical figure.
2. **Design the correspondence.** Decide which aspects of the body the character should follow and how the movement reads on the display.
3. **Test the encounter.** Rehearse entering the sensing area, moving, pausing, and leaving from the visitor's actual position.

### Input to output

Kinect v2: Tracked body input | Body mapping: Sensor movement becomes character control | Unity character: Real-time performance | Museum display: A visitor and a historical figure move together

### Proposed study

How does movement correspondence affect engagement with a historical digital character?

Vary: The mapping between the visitor's pose and the character's movement.

Hold consistent: Character identity, scene, task duration, and educational material.

### Evidence to add

- Record Kinect v2 tracking and the corresponding Unity character movement side by side.
- Show the actual body-to-character mapping component and how the application behaves when a person enters or leaves the tracked area.

Scope note: Kinect v2 is confirmed by the artist. This case is distinct from the Azure Kinect implementation in To Eternity.

Project archive: https://jonghoonahn.com/detail_pages/interactive_7.html

## Track 6

**My role:** Director / technical artist

**Question:** What kind of performance emerges when a body no longer appears under familiar visual rules?

**Premise:** The body becomes a way to draw and disturb a virtual environment. Dance is translated into a changing geometric system.

**Implementation:** I used Kinect v2 to capture body movement and map it into Unity's geometric visual environments. The installation connects six music tracks with a space in which movement can produce deliberately altered visual relationships.

### Development decisions

1. **Define the alternate body.** Choose how a person should appear when represented through geometric forms.
2. **Relate rhythm and mapping.** Consider how each musical context changes the participant's reading of movement.
3. **Rehearse the action.** Observe the same body movement under the selected visual mappings and adjust their legibility.

### Input to output

Kinect v2: Full-body tracking | Movement mapping: Pose enters the visual environment | Geometry / music: A changing performance context | Display: An alternate visual body

### Proposed study

How does an abstract body representation change exploratory movement?

Vary: The mapping from tracked pose to geometric form.

Hold consistent: Input recording, musical context, display, and exposure time.

### Evidence to add

- Show Kinect v2 input and the resulting geometric representation simultaneously.
- Replay one motion through two actual mappings. Identify which behavior is an artistic transformation rather than a physical simulation.

Scope note: Kinect v2 and body-to-geometry interaction are confirmed. No physical accuracy or measured behavioral effect is asserted.

Project archive: https://jonghoonahn.com/detail_pages/interactive_8.html

## AI Gang Se-hwang

**My role:** Technical director / Unity integration

**Question:** What changes when a historical representation can move, speak, and share an encounter with a visitor?

**Premise:** A historical portrait becomes a figure that can perform and respond. Cultural memory is encountered through a real-time digital body.

**Implementation:** I brought the digital human into Unity HDRP and integrated character assets, body and facial performance, animation, and museum interaction. The work connects the prepared character to a running presentation rather than stopping at a rendered likeness.

### Development decisions

1. **Anchor the representation.** Use historical visual references to establish what the digital figure needs to communicate.
2. **Plan the performance pipeline.** Separate source assets and recorded performance from Unity-side playback and interaction logic.
3. **Inspect the final encounter.** Judge the character in the actual visitor-facing presentation, including transition into and out of an interaction.

### Input to output

Character assets: Model, materials, and performance data | Unity HDRP: Character and animation integration | Interaction state: Visitor-facing presentation behavior | Museum runtime: A responsive digital figure

### Proposed study

How does responsive animation change the perceived presence of a historical digital figure?

Vary: The relation between visitor input and character performance.

Hold consistent: Character model, dialogue material, display, and scene.

### Evidence to add

- Show the character rig, Animator or actual animation-control system, and one interaction-triggered transition in Unity.
- Connect that Editor capture to the installed kiosk or display. Label source performance assets separately from runtime logic.

Scope note: This is Unity HDRP work. Shininho and Jooan's Unreal / MetaHuman production remains separate. Older venue-name differences are not resolved by guessing.

Project archive: https://jonghoonahn.com/detail_pages/interactive_2.html

## AI ZOO

**My role:** Director / technical artist

**Question:** Why can a person feel responsible for an artificial entity whose feelings cannot be assumed?

**Premise:** A confined artificial figure can make a visitor feel concern, discomfort, or responsibility. The work asks where those feelings actually arise.

**Implementation:** I connected a Unity digital human and real-time LLM conversation with hand sensing, generated voice, Arduino servo motors, and lighting. Unity and Python coordinate the inputs and outputs so a reply can become a physical, vocal, and visual event.

### Development decisions

1. **Stage the asymmetry.** Define the visitor's ability to intervene and the artificial figure's apparent inability to leave.
2. **Choose an output vocabulary.** Assign expressive roles to movement, light, voice, and response timing.
3. **Connect the bench to the encounter.** Inspect one input through each output channel, then judge how the combined response is read in the installation.

### Input to output

Visitor input: Language and hand sensing | Response state: LLM output and system coordination | Embodied output: Digital human, voice, light, servos | Human interpretation: The visitor decides how to respond

### Proposed study

How does adding physical motion change the interpretation of the same AI response?

Vary: The servo-driven movement accompanying a fixed response.

Hold consistent: Dialogue, digital-human appearance, response timing, and spatial setting.

### Evidence to add

- Record a hand or language input, the response/control state, and servo, light, voice, and digital-human output together.
- Show the Arduino connection and one controlled motor command. Also show the implemented interrupted-input and reset behavior.

Scope note: The artist confirms the LLM, digital-human, hand-sensing, Arduino servo, and light integration. Emotional responses are artistic and research questions, not reported study results.

Project archive: https://jonghoonahn.com/detail_pages/interactive_4.html

## AI Choi Jung-hoon

**My role:** Artist / technical director

**Question:** What does it feel like when a representation of a performer I admire appears to speak directly to me?

**Premise:** Admiration changes when a mediated likeness appears able to answer. An existing emotional relation becomes the context for a synthetic encounter.

**Implementation:** I integrated a real-time digital human in Unity with spoken input, GPT-based replies, synthesized speech, and facial performance. The project brings the conversation into a visibly performing character rather than presenting a text-only chat interface.

### Development decisions

1. **Begin with recognition.** Use a personally meaningful figure to make familiarity part of the premise.
2. **Prepare the performable character.** Move from a visual reference to an animation-ready figure that can articulate new responses.
3. **Assemble one complete turn.** Inspect incoming speech, model reply, spoken output, and facial performance as one exchange.

### Input to output

Spoken input: The visitor addresses the figure | Language response: Speech transcription and GPT dialogue | Voice / performance: Synthesized audio and facial animation | Unity presentation: A real-time conversational character

### Proposed study

How does familiarity with a represented person affect the interpretation of conversational responsiveness?

Vary: Familiar versus unfamiliar character presentation.

Hold consistent: Dialogue content, response timing, voice presentation, and interaction duration.

### Evidence to add

- Show microphone input, recognized text, generated reply, audio playback, and facial performance during one turn.
- Show the actual Unity response-sequencing components. Avoid describing the representation as the real performer's participation or an official collaboration.

Scope note: The canonical archive title is AI Choi Jung-hoon. This is the spoken-dialogue digital-human case identified by the artist as 메이아이 최정훈. No measured intimacy or identity-equivalence result is claimed.

Project archive: https://jonghoonahn.com/detail_pages/interactive_9.html

## Fineo, Translated Universe

**My role:** Co-artist / developer

**Question:** What kind of world becomes possible when scientific classification is treated as material for construction?

**Premise:** A periodic table becomes the material for another universe. Numerical relationships are translated into forms that can be encountered as a world.

**Implementation:** I contributed to the collaborative data-visualization and Unity VR work. Elemental data is translated through harmonograph-based form generation, then organized into a speculative spatial system. The contribution is both a visual translation method and the construction of an inhabitable virtual world.

### Development decisions

1. **Set the proposition.** Treat data as a source of constructed matter rather than a table that must stay on a flat page.
2. **Design the translation.** Choose the relation between data differences, generated form, and the visual vocabulary of the world.
3. **Compose across scales.** Move from individual forms to clusters and a navigable setting. Judge whether the translation remains perceptible across those scales.

### Input to output

Elemental data: A structured source of differences | Harmonograph forms: Data mapped into generative geometry | Constructed relations: Forms become a larger spatial system | VR encounter: The viewer enters the translated world

### Proposed study

How does entering a data-derived world change the relationships a viewer notices?

Vary: A flat arrangement versus an explorable spatial arrangement of the same generated forms.

Hold consistent: Source data, form-generation rules, labeling, and exposure time.

### Evidence to add

- Show one actual data entry, its generation parameters, the resulting form, and its placement in the Unity world.
- Connect that sequence to VR navigation. Confirm the original data-to-parameter mapping before presenting any equation as production code.

Scope note: The harmonograph, periodic-table, collaborative authorship, and VR premise are documented. Old hardware lists and inconsistent equations are not used as implementation evidence.

Project archive: https://jonghoonahn.com/detail_pages/xr_1.html

## Escape Metro

**My role:** Game developer / technical director

**Question:** What happens when negotiating with an AI's rules becomes the rule of a game?

**Premise:** Conversation becomes an escape mechanic. The player tries to persuade an AI guard to reveal information it is meant to withhold.

**Implementation:** I developed the Unity VR experience and connected GPT-based NPC dialogue to puzzles and progression. The LLM jailbreaking premise gives the player a practical objective: uncover a protected password or clue and use it to move toward escape.

### Development decisions

1. **Write the constraint.** Define what the guard knows, what it should protect, and why the player needs that information.
2. **Build the conversational objective.** Connect the exchange to a password, clue, and escape condition that can be inspected in the game.
3. **Keep the exchange in the world.** Coordinate the NPC's response and presentation with the player's ongoing VR task.

### Input to output

Player speech: A question or persuasive attempt | GPT NPC: A response within the character's constraints | Puzzle state: Information linked to a progression condition | World feedback: Character performance and escape flow

### Proposed study

How do players understand and negotiate a conversational constraint when it determines game progression?

Vary: The way the NPC explains or withholds its rule.

Hold consistent: Puzzle goal, protected information, world, and response presentation.

### Evidence to add

- Record an ordinary question and an attempt that produces a useful clue, with the corresponding puzzle state visible.
- Show the actual condition that permits progression. Record the response and world change in the same sequence.

### Engineering inspection

New review notes. Failure cases are proposed checks, not reported production incidents.

**Design decision:** Give dialogue a task consequence. The original work connects GPT conversation to progression. The independent source further separates reply presentation from the rule that authorizes an unlock.
**Failure case to exercise:** In the independent example, return a reply from an earlier turn, reset before a reply arrives, and attempt an unlock without puzzle evidence. These are source-defined checks with Unity execution pending.
**Observable evidence:** Record reply identifiers and three outcomes: an outdated reply is rejected, a valid reply is presented, and progression changes only when its own conditions are met. Show the corresponding source revision.
**Reuse boundary:** NpcProgressGate illustrates turn/epoch validation and explicit progression rules. It includes no speech service, model API, original NPC prompts, or complete escape game.

Scope note: Escape Metro and RedFlight AI are the same project. No original response-latency, model-training, or commercial online-service claim is added.

Project archive: https://jonghoonahn.com/detail_pages/xr_4.html

## NARCI / Be NARCI

**My role:** Director / technical artist

**Question:** How does an experience change when the participant moves from receiving control to exercising it?

**Premise:** A constrained VR encounter explores narcissistic relationships. A companion work reverses the participant's role and makes control something they perform.

**Implementation:** I built the Unity XR encounters and connected tracked-hand interaction to runtime scene and material states. NARCI places the participant within a confined sequence; Be NARCI gives them actions that alter other human-like figures.

### Development decisions

1. **Choose the participant's position.** Define whether the person receives an encounter or acts on another figure.
2. **Translate the relation into space.** Use enclosure, distance, available actions, and consequences as the design material.
3. **Rehearse in the headset.** Judge the relation at body scale, including reach, encounter timing, and the visibility of feedback.

### Input to output

Embodied input: Headset presence and tracked hands | Unity interaction: Available gestures and runtime events | Scene response: Encounter sequence and visible state changes | Role / interpretation: The participant experiences a relation of power

### Proposed study

How does role reversal in the same theme change perceived agency and responsibility?

Vary: The participant's available actions and position within the encounter.

Hold consistent: The thematic context, character material, exposure time, and measurement procedure.

### Evidence to add

- Record the actual tracked-hand event and the resulting Unity state. Show input loss and reacquisition if the current implementation supports it.
- Record NARCI and Be NARCI separately to show the different actions available to the participant.

Scope note: The hand-tracked XR implementation and paired experience are documented. Reflection and recovery remain design intentions, not reported treatment results.

Project archive: https://jonghoonahn.com/detail_pages/xr_2.html

## Graffiti Freedom

**My role:** Artist / Unity developer

**Question:** What does it mean to leave a mark when the place and its consequences are virtual?

**Premise:** Move the act of graffiti into a virtual subway. The gesture of marking a shared space is separated from physical residue and real-world site permissions.

**Implementation:** I developed the Unity VR spray interaction using particles, surface-hit information, and a dynamic RenderTexture used by the wall material. Short-lived spray feedback and the accumulated painted surface play different roles in the experience.

### Development decisions

1. **Retain the gesture.** Choose the parts of spray painting that need a bodily action and immediate feedback.
2. **Decide what persists.** Separate the short spray from the longer-lived surface state.
3. **Stage the public place.** Use a recognizable shared environment so the act of marking it carries the premise.

### Input to output

VR input: A spray action in space | Particle feedback: Emission and surface contact | Texture state: Paint accumulates in a RenderTexture | Wall material: The environment retains a visible mark

### Proposed study

How does changing the persistence of a virtual mark affect a person's sense of agency over a space?

Vary: How long the painted surface state remains visible.

Hold consistent: Spray input, wall, brush appearance, and exposure time.

### Evidence to add

- Show spray input, particle feedback, surface-hit diagnostics, the RenderTexture, and the wall material together.
- Stop spraying to show the difference between transient feedback and the retained mark. Confirm any save/load feature from the original source before adding it.

Scope note: Graffiti Freedom is the archive title for the virtual-subway graffiti work. No quantified environmental benefit or unverified save/load behavior is claimed.

Project archive: https://jonghoonahn.com/detail_pages/xr_5.html
