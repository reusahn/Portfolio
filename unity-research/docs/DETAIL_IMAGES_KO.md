# 상세페이지 이미지 교체와 Unity 촬영 가이드

상세페이지 15개에 Unity 기능 설명 45개, 이미지 슬롯 27개, 시스템 구조도 15개를 추가했습니다. 대문의 문구와 카드 순서, 2열 구성은 유지했습니다.

## 이번에 작성한 내용과 자료의 범위

- **기존 구현**: 사용자 확인과 공개 작품 자료에 근거한 Unity 기능 설명 및 기존 사진.
- **이번에 구현**: 상세페이지 구성, 기능별 본문, SVG 시스템 구조도, 이미지 교체 도구.
- **추가 제작 필요**: 기능별 `Unity view to capture`에 적은 Editor·Game view·센서 동시 촬영.
- **검증 필요**: 새 독립 C# 예제의 Unity 컴파일과 실행. 기존 공개 영상도 새 코드 실행 증거로 바꾸어 사용하지 않습니다.

기능 본문은 `content/unity-details.json`, 기존 작품 정보는 `content/projects.json`, 페이지 생성은 `tools/build_portfolio.py`에서 관리합니다.

## 이미지 표기

- `archive`: 기존 작품 이미지. 실제 작품 자료이지만 코드·성능의 증거를 대신하지 않습니다.
- `editor`: 실제 Unity 화면. 현재 강세황 첫 이미지에 적용했습니다.
- `reference`: 임시 참고 이미지. 에릭오 셰이더와 그래피티 이미지 2개는 내장 이미지 생성 도구로 제작했습니다. 실제 Unity 결과로 표시하지 않습니다.
- 구조도는 코드로 작성한 설명 자료이며 Editor 화면이 아닙니다.

## 가장 쉬운 교체 방법

원본 홈페이지 이미지 파일은 덮어쓰지 않습니다. 새 이미지를 `unity-research/assets/details/`에 넣고 아래 방법 중 하나를 사용합니다.

### JSON에서 수정하기

1. `content/unity-details.json`에서 아래 표의 `slot`을 찾습니다.
2. `src`를 새 이미지 경로로 바꿉니다. 예: `assets/details/narci-hand-response.jpg`.
3. `kind`, `caption`, `alt`, 실제 `width`, `height`를 수정합니다. 실제 Editor 캡처만 `editor`로 표시합니다.
4. `unity-research` 디렉터리에서 `python tools/build_portfolio.py`를 실행합니다. 생성된 HTML과 이미지, JSON을 함께 커밋합니다.

### 파일 복사와 JSON 변경을 한 번에 하기

```bash
python tools/replace_detail_image.py \
  --project narci \
  --slot narci-hand-response \
  --image /absolute/path/hand-capture.jpg \
  --kind editor \
  --caption "Unity hand input and the resulting material change." \
  --alt "Unity Editor showing a hand event and the affected figure" \
  --width 1920 --height 1080
python tools/build_portfolio.py
```

이미지 파일은 해당 슬롯 이름으로 복사됩니다. 기존 작품 아카이브는 변경하지 않습니다. 이미지 내용의 사실 여부나 픽셀 크기를 도구가 대신 검증하지는 않습니다.

## 작품별 슬롯

| 작품 | 슬롯 | 현재 이미지 | 구분 |
|---|---|---|---|
| Algorithm of Flowers and Grammar of Waves | `flowers-vfx-graph` | `../assets/images/flower-waves/flower-waves-02.jpg` | archive |
| Algorithm of Flowers and Grammar of Waves | `flowers-variation` | `../assets/images/flower-waves/flower-waves-04.jpg` | archive |
| Beads Wall | `beads-webcam-vfx` | `../assets/images/interactive10_2.jpg` | archive |
| Fall of Minds | `fall-audio-controls` | `../assets/images/media3_1.jpg` | archive |
| Fall of Minds | `fall-display` | `../assets/images/media3_4.jpg` | archive |
| Erick Oh game collaboration | `erick-cloud-metaball` | `assets/reference/shader-reference.png` | reference |
| Erick Oh game collaboration | `erick-growth-targets` | `../media/game/07_growth_maya_views.jpg` | archive |
| To Eternity | `eternity-sensor-timeline` | `../assets/images/e3.png` | archive |
| To Eternity | `eternity-composition` | `../assets/images/e5.png` | archive |
| Jemulpo Photo Studio | `jemulpo-ai-stages` | `../assets/images/g4.png` | archive |
| Jemulpo Photo Studio | `jemulpo-installation` | `../assets/images/g2.png` | archive |
| Silhak Dance | `silhak-body-mapping` | `../assets/images/interactive7_1.jpg` | archive |
| Silhak Dance | `silhak-character` | `../assets/images/interactive7_2.jpg` | archive |
| Track 6 | `track6-mapping` | `../assets/images/interactive8_1.jpg` | archive |
| Track 6 | `track6-installation` | `../assets/images/interactive8_2.jpg` | archive |
| AI Gang Se-hwang | `gang-unity-integration` | `../assets/images/GangSehwang_unity_01.jpg` | editor |
| AI Gang Se-hwang | `gang-installation` | `../assets/images/GangSehwang_install_01.jpg` | archive |
| AI ZOO | `aizoo-hand-input` | `../assets/images/AI_ZOO_07.jpg` | archive |
| AI ZOO | `aizoo-arduino-output` | `../assets/images/AI_ZOO_03.jpg` | archive |
| AI Choi Jung-hoon | `choi-spoken-turn` | `../assets/images/interactive9_1.jpg` | archive |
| AI Choi Jung-hoon | `choi-facial-playback` | `../assets/images/ChoiJungHoon_AI_08.jpg` | archive |
| Fineo, Translated Universe | `fineo-data-form` | `../assets/images/fineo3.jpg` | archive |
| Fineo, Translated Universe | `fineo-world` | `../assets/images/fineo12.jpg` | archive |
| Escape Metro | `escape-dialogue-progression` | `../assets/images/xr4.jpg` | archive |
| NARCI / Be NARCI | `narci-encounter` | `../assets/images/xr2.jpg` | archive |
| NARCI / Be NARCI | `narci-hand-response` | `../assets/images/xr3.jpg` | archive |
| Graffiti Freedom | `graffiti-rendertexture` | `assets/reference/painting-reference.png` | reference |

## 기능별로 찍어야 할 화면

화면 전체 1920×1080 이상을 권장합니다. 실제 Inspector·Graph·입력 상태와 Game view를 가능한 한 함께 보여줍니다. 주장하는 동작이 이어지는 20–40초 정도의 무편집 영상이 스틸보다 유용합니다. 아래 항목은 **촬영 지시**이며 이미 촬영했다는 뜻이 아닙니다.

### Algorithm of Flowers and Grammar of Waves

1. **Use VFX Graph as the image-making system**
   - 화면: The actual graph and the particle setup used for one documented scene.
   - 동작: Show the graph beside the corresponding Game view while changing one existing control.
2. **Shape the image through shader work**
   - 화면: The material and shader controls beside the relevant VFX Graph stages.
   - 동작: Compare the same scene with one treatment changed while keeping the remaining setup fixed.
3. **Author variations within one visual language**
   - 화면: The production scene and the settings associated with two existing variations.
   - 동작: Connect each Unity configuration to its corresponding documented still or sequence.

### Beads Wall

1. **Connect a live webcam image to the visual system**
   - 화면: The actual webcam source and the image passed into the visual stage.
   - 동작: Move through the camera frame and pause so source updates are easy to identify.
2. **Map the image into VFX Graph output**
   - 화면: The graph input binding and the stages that affect particle appearance or placement.
   - 동작: Show source, graph, and final display together while one person moves across the frame.
3. **Keep a person's action legible through abstraction**
   - 화면: Particle and material controls beside the installed output.
   - 동작: Use a clear movement, a still pose, and a departure to show what the displayed field retains or changes.

### Fall of Minds

1. **Use the venue's sound as live input**
   - 화면: The actual audio input and the control values extracted from it.
   - 동작: Record quieter and busier input without changing the visual configuration.
2. **Translate sound into a cascading form**
   - 화면: The actual value-to-visual mapping and the scene parameters it changes.
   - 동작: Keep the incoming control value and visible response together during a clear sound change.
3. **Make the response part of a public environment**
   - 화면: The running visual scene and its real display context.
   - 동작: Capture the sound environment and screen together so the input-to-response relation is observable.

### Erick Oh game collaboration

1. **Control cloud form independently of object motion**
   - 화면: Transform values beside the actual shader parameters and their C# control path.
   - 동작: Keep the object position fixed while reversing the internal flow or changing deformation strength.
2. **Render droplet fusion through raymarched metaballs**
   - 화면: The production field definition and raymarching pass beside the separate contact or proximity logic.
   - 동작: Move two field sources together, show the fusion, and identify how interaction is evaluated.
3. **Preserve the artist's control over transformation**
   - 화면: The Maya target states, their shared topology, and their actual Unity control.
   - 동작: Move through the authored states and distinguish that process from procedural shader deformation.

### To Eternity

1. **Connect a participant's body to Unity**
   - 화면: The actual sensor connection, body input, and the component that recognizes participation.
   - 동작: Show a person entering the sensing area, performing the action, and producing the corresponding event.
2. **Let live input enter an authored Timeline**
   - 화면: The Timeline asset, its bound media tracks, and the code or event that changes playback.
   - 동작: Keep the participant, recognized event, Timeline playhead, and Game view visible during one transition.
3. **Compose the memorial from a live presence**
   - 화면: The live input image, the composition stage, and its final presentation layer.
   - 동작: Record the source body image and the memorial result together, followed by the actual reset behavior.

### Jemulpo Photo Studio

1. **Carry a live portrait through an AI pipeline**
   - 화면: The Barracuda model asset, its actual input and output, and the Unity/Python handoff.
   - 동작: Use one portrait to show the source image and each implemented processing result.
2. **Combine style transformation with visual filters**
   - 화면: The style-processing stage, filter controls, and final composed portrait.
   - 동작: Toggle the actual available layers for the same image so their separate contributions are visible.
3. **Move the result into a shared installation**
   - 화면: The actual participant routing, saved output, and sender/receiver components for the public display.
   - 동작: Follow one completed portrait from its creation station to the gallery display, then show the actual multi-participant setup.

### Silhak Dance

1. **Bring Kinect v2 movement into Unity**
   - 화면: The Kinect v2 input component and its tracked-body output.
   - 동작: Show a visitor moving alongside the tracking view and Unity output.
2. **Map a living body onto Kim Yuk**
   - 화면: The actual body-to-character mapping component, rig, and affected transforms.
   - 동작: Perform a slow arm movement and a change in body position so the correspondence is easy to follow.
3. **Present the mapping as an encounter**
   - 화면: The character in its presentation scene and the visitor's usable tracking area.
   - 동작: Record the installed view and the implemented behavior when the visitor leaves the area.

### Track 6

1. **Read movement as a live control**
   - 화면: The tracked-body data and the scene component that consumes it.
   - 동작: Keep the participant, tracked body, and geometric response in the same recording.
2. **Translate the body instead of copying it**
   - 화면: The actual movement-to-geometry controls and their affected scene objects.
   - 동작: Repeat one movement through two existing visual mappings and keep the difference visible.
3. **Stage movement within six musical contexts**
   - 화면: The existing track-control mechanism and the visual setup associated with it.
   - 동작: Show a real track change and the corresponding presentation without assuming an unverified synchronization algorithm.

### AI Gang Se-hwang

1. **Bring the digital human into Unity HDRP**
   - 화면: The character hierarchy, material assignments, lighting, and Game view.
   - 동작: Show the same character in Scene view and the final camera view.
2. **Coordinate body and facial performance**
   - 화면: The actual animation-control setup, imported clips or performance data, and facial controls.
   - 동작: Trigger one implemented performance and show the character's body and face during playback.
3. **Integrate the character with museum interaction**
   - 화면: The actual interaction trigger and the scene response used by the museum application.
   - 동작: Record a visitor-facing action, its Unity response, and the installed screen in one sequence.

### AI ZOO

1. **Coordinate language, voice, and a digital human**
   - 화면: The incoming turn, generated reply, voice playback, and character response.
   - 동작: Record one complete input-to-response turn with the actual control state visible.
2. **Keep hand sensing as an explicit input path**
   - 화면: The actual hand-sensor output and the component that receives it in the installation.
   - 동작: Perform one controlled hand action and show the resulting system response.
3. **Turn system responses into physical output**
   - 화면: The Arduino connection, one actual control command, and the connected motor or light.
   - 동작: Send one implemented command, show the physical output, then record the available reset or stop behavior.

### AI Choi Jung-hoon

1. **Connect a spoken turn to a generated reply**
   - 화면: Microphone input, recognized text, the request, and the returned response.
   - 동작: Keep one spoken question and its generated reply in an uncut recording.
2. **Perform the reply through voice and face**
   - 화면: The generated audio, playback state, and actual facial-animation controls.
   - 동작: Show the response text alongside the audible reply and the character's facial movement.
3. **Present the conversation as a real-time character**
   - 화면: The character hierarchy, presentation scene, and components coordinating a conversational turn.
   - 동작: Show the resting character, an incoming turn, its performed response, and the implemented return to the next interaction.

### Fineo, Translated Universe

1. **Data becomes a family of generated forms**
   - 화면: One source entry, its actual generation parameters, and the resulting object.
   - 동작: Compare two elements while keeping the visualization rule consistent.
2. **Generated objects become spatial relationships**
   - 화면: The generated forms in the Unity scene and their organization into a larger environment.
   - 동작: Move from a single form to the surrounding group without changing its identity.
3. **The viewer enters the translation**
   - 화면: The VR viewing setup and the scene as experienced from the participant's position.
   - 동작: Record navigation from one generated form to its surrounding spatial relationships.

### Escape Metro

1. **The NPC conversation belongs to the puzzle**
   - 화면: The conversation component, a submitted turn, and the response presented by the NPC.
   - 동작: Compare an ordinary question with an attempt that produces useful puzzle information.
2. **Information is connected to progression**
   - 화면: The actual progression condition and the scene object changed when it succeeds.
   - 동작: Keep the clue, the player's follow-up action, and the resulting world change in one recording.
3. **Jailbreaking becomes a playable constraint**
   - 화면: The character's authored constraint and the game situation in which it matters.
   - 동작: Show how one conversation changes the player's next available action in the environment.

### NARCI / Be NARCI

1. **Tracked hands become interaction events**
   - 화면: The hand-input component, its event binding, and the receiving object or script.
   - 동작: Perform one gesture slowly and show the corresponding event and visible response together.
2. **Interaction changes the scene and its materials**
   - 화면: The affected object and material beside the component that changes their state.
   - 동작: Show the same object before, during, and after one accepted interaction.
3. **A different role requires different available actions**
   - 화면: The two scene setups and the objects that receive participant input in each.
   - 동작: Record each experience separately so their different interaction rules remain visible.

### Graffiti Freedom

1. **A spatial action produces a spray effect**
   - 화면: The input binding, particle emission, and the surface-contact information used by the painting path.
   - 동작: Start and stop the spray while keeping the wall and input visible.
2. **The wall stores the result in a render target**
   - 화면: The RenderTexture asset or runtime target and the wall material that reads it.
   - 동작: Show the render target updating, then stop the particles and show the mark that remains.
3. **A virtual subway becomes a space to alter**
   - 화면: The paintable surfaces and their relationship to the participant's reachable space.
   - 동작: Paint across the actual supported area and show how the surface carries the result.

## 생성 참고 이미지의 출처와 프롬프트

내장 이미지 생성 도구를 사용했습니다. 생성 이미지는 실제 작품의 복제나 Unity 실행 기록이 아닙니다.

- `assets/reference/shader-reference.png` / 프롬프트: `assets/reference/shader-reference-prompt.txt`
- `assets/reference/painting-reference.png` / 프롬프트: `assets/reference/painting-reference-prompt.txt`

이 두 이미지의 캡션과 `reference` 표기는 실제 작품 캡처로 교체할 때만 함께 바꿉니다.

## 검증 범위

HTML·링크·앵커와 이미지 파일을 정적으로 검사하고 데스크톱·모바일 브라우저 레이아웃을 확인합니다. 이 작업은 Unity 컴파일·Quest 실행·성능 측정·사용자 연구를 새로 검증한 것이 아닙니다.
