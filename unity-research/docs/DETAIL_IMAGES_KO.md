# 상세페이지 이미지 교체와 엔진별 촬영 가이드

대문은 Physical & Sensor Systems / VR & Interaction / Graphics & VFX / Digital Humans의 4개 분야, 13개 작품으로 구성했습니다. 디지털 휴먼은 넓은 화면에서 3열, 나머지는 2열이며 모바일은 1열입니다. 기존 Track 6·Fineo·NARCI 페이지는 유지합니다.

## 작성 내용과 자료의 범위

- **기존 구현**: 사용자 확인과 공개 제작 아카이브에 근거한 기능 및 기존 이미지·영상.
- **이번에 구현**: 4개 분야의 대문, 신인호 상세페이지, 13개 작품의 기술 본문 수정, 엔진별 구분과 시스템 구조도.
- **추가 제작 필요**: 아래 목록의 실제 Inspector·Graph·입력·Game view 동시 촬영. 공개 상세페이지에 촬영 체크리스트는 표시하지 않습니다.
- **검증 필요**: 독립 C# 예제의 Unity 컴파일과 실행. 기존 작품 영상은 새 예제의 실행 증거가 아닙니다.

기능 본문은 `content/unity-details.json`, 작품·엔진·노출 여부·순서는 `content/projects.json`, 페이지 생성은 `tools/build_portfolio.py`에서 관리합니다. `in_catalog`와 `catalog_order`로 대문 노출 및 순서를 정합니다. `engine`은 Unity와 Unreal Engine을 구분합니다. `unity-details.json` 파일명은 기존 편집 도구와의 호환성을 위해 유지합니다.

## 기술 용어를 구분한 기준

| 작품 | 확인된 구현 | 원본 확인 전 추가하지 않는 설명 |
|---|---|---|
| AI ZOO | Unity/Python, Leap Motion, LLM/음성, Arduino 서보·조명 | 정확한 시리얼 프로토콜·모터 제한·중단 처리 |
| To Eternity | Azure Kinect, Timeline, 실시간 이미지 합성 | 확인되지 않은 정량 임계값·처리 성능 |
| Silhak Dance | Kinect v2, 신체-캐릭터 매핑 | 특정 IK·관절 보정·필터 알고리즘 |
| Jemulpo | Barracuda 인물 분리, OpenCV, 스타일 변환·필터, TCP/UDP, 최대 4인 | 스타일 모델 전체가 Barracuda에서 실행된다는 설명·상용 게임 운영 |
| Escape Metro | GPT NPC 대화, 암호/힌트, 퍼즐 진행, Unity VR | 확정되지 않은 음성 입력 방식·보안 벤치마크 |
| Graffiti Freedom | VR 스프레이, 파티클, 표면 정보, RenderTexture | 핸드트래킹·특정 Raycast/Collision API·디스크 저장 |
| Erick Oh | 구름 HLSL/흐름, 물방울 raymarched metaballs, Maya 동일 토폴로지 성장 타깃 | 구름 렌더러가 레이마칭이라는 단정·Unity BlendShape 런타임 |
| Fall of Minds | 현장 사운드 반응 실시간 비주얼 | HDRP Volumetric Fog·볼륨 레이마칭·FFT |
| Flowers / Waves | VFX Graph 파티클, 셰이더, 미디어월 영상 시리즈 | 내장 Particle System 사용·특정 영상 샘플링·프로젝션 매핑 |
| Beads Wall | 웹캠, VFX Graph 이미지 매핑, 구슬 같은 파티클 | 구체적인 3D sphere instancing·샘플링 식 |
| Shininho | 초기 Unity 실현성 시험, Maya/Wrap/MetaHuman, 모션 정리, Unreal Sequencer | 완성된 가족 기억 LLM·정량 인지 연구·Unity 최종 MetaHuman |
| AI Choi | CC4, Unity, 음성/GPT/TTS, 얼굴 블렌드셰이프 | 실제 인물의 공식 참여·측정하지 않은 대화 성능 |
| Gang Se-hwang | Unity HDRP, 캐릭터·애니메이션 통합, 박물관 실행 | Unreal/MetaHuman으로 표기·미확인 인식 알고리즘 |

## 이미지 표기

- `archive`: 기존 작품 이미지. 실제 작품 자료이지만 코드·성능의 증거를 대신하지 않습니다.
- `editor`: 실제 엔진 화면. 현재 강세황 첫 이미지에 적용했습니다.
- `reference`: 임시 참고 이미지. 에릭오 셰이더와 그래피티 이미지 2개는 내장 이미지 생성 도구로 제작했습니다. 실제 Unity 결과로 표시하지 않습니다.
- 구조도는 코드로 작성한 설명 자료이며 Editor 화면이 아닙니다.

## 가장 쉬운 교체 방법

원본 홈페이지 이미지 파일은 덮어쓰지 않습니다. 새 이미지를 `unity-research/assets/details/`에 넣고 아래 방법 중 하나를 사용합니다.

### JSON에서 수정하기

1. `content/unity-details.json`에서 아래 표의 `slot`을 찾습니다.
2. `src`를 새 이미지 경로로 바꿉니다. 예: `assets/details/narci-hand-response.jpg`.
3. `kind`, `caption`, `alt`, 실제 `width`, `height`를 수정합니다. 실제 엔진 Editor 캡처만 `editor`로 표시합니다.
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
| Shininho | `shininho-source-rebuild` | `../media/shininho/03_scan_proto_metahuman.jpg` | archive |
| Shininho | `shininho-wrap` | `../media/shininho/04_wrap_template.jpg` | archive |
| Shininho | `shininho-performance` | `../media/shininho/07_mocap_capture.jpg` | archive |

## 기능별로 찍어야 할 화면

실제 입력 상태와 Inspector·Graph·Game view를 함께 보여주는 무편집 20–40초 영상을 권장합니다. 신인호는 Unity 초기 빌드와 Unreal 최종 결과를 따로 표시합니다. 아래는 제작 지시이며 이미 촬영한 결과가 아닙니다.

### AI ZOO

1. **LLM dialogue & digital human**
   - 화면: The incoming turn, generated reply, voice playback, and character response.
   - 동작: Record one complete input-to-response turn with the actual control state visible.
2. **Leap Motion hand input**
   - 화면: The actual hand-sensor output and the component that receives it in the installation.
   - 동작: Perform one controlled hand action and show the resulting system response.
3. **Arduino servos & lighting**
   - 화면: The Arduino connection, one actual control command, and the connected motor or light.
   - 동작: Send one implemented command, show the physical output, then record the available reset or stop behavior.

### To Eternity

1. **Azure Kinect input**
   - 화면: The actual sensor connection, body input, and the component that recognizes participation.
   - 동작: Show a person entering the sensing area, performing the action, and producing the corresponding event.
2. **Unity Timeline**
   - 화면: The Timeline asset, its bound media tracks, and the code or event that changes playback.
   - 동작: Keep the participant, recognized event, Timeline playhead, and Game view visible during one transition.
3. **Live archival-image composition**
   - 화면: The live input image, the composition stage, and its final presentation layer.
   - 동작: Record the source body image and the memorial result together, followed by the actual reset behavior.

### Silhak Dance

1. **Kinect v2 body tracking**
   - 화면: The Kinect v2 input component and its tracked-body output.
   - 동작: Show a visitor moving alongside the tracking view and Unity output.
2. **Body-to-character mapping**
   - 화면: The actual body-to-character mapping component, rig, and affected transforms.
   - 동작: Perform a slow arm movement and a change in body position so the correspondence is easy to follow.
3. **Museum presentation**
   - 화면: The character in its presentation scene and the visitor's usable tracking area.
   - 동작: Record the installed view and the implemented behavior when the visitor leaves the area.

### Jemulpo Photo Studio

1. **Barracuda segmentation & OpenCV**
   - 화면: The Barracuda model asset, its actual input and output, and the Unity/Python handoff.
   - 동작: Use one portrait to show the source image and each implemented processing result.
2. **Style transformation & filters**
   - 화면: The style-processing stage, filter controls, and final composed portrait.
   - 동작: Toggle the actual available layers for the same image so their separate contributions are visible.
3. **Four-person exhibition workflow**
   - 화면: The actual participant routing, saved output, and sender/receiver components for the public display.
   - 동작: Follow one completed portrait from its creation station to the gallery display, then show the actual multi-participant setup.

### Escape Metro

1. **GPT-based NPC dialogue**
   - 화면: The conversation component, a submitted turn, and the response presented by the NPC.
   - 동작: Compare an ordinary question with an attempt that produces useful puzzle information.
2. **Dialogue-to-puzzle integration**
   - 화면: The actual progression condition and the scene object changed when it succeeds.
   - 동작: Keep the clue, the player's follow-up action, and the resulting world change in one recording.
3. **Jailbreaking as a game mechanic**
   - 화면: The character's authored constraint and the game situation in which it matters.
   - 동작: Show how one conversation changes the player's next available action in the environment.

### Graffiti Freedom

1. **VR spray & particles**
   - 화면: The input binding, particle emission, and the surface-contact information used by the painting path.
   - 동작: Start and stop the spray while keeping the wall and input visible.
2. **RenderTexture painting**
   - 화면: The RenderTexture asset or runtime target and the wall material that reads it.
   - 동작: Show the render target updating, then stop the particles and show the mark that remains.
3. **A paintable virtual subway**
   - 화면: The paintable surfaces and their relationship to the participant's reachable space.
   - 동작: Paint across the actual supported area and show how the surface carries the result.

### Erick Oh game collaboration

1. **Cloud shading & internal flow**
   - 화면: Transform values beside the actual shader parameters and their C# control path.
   - 동작: Keep the object position fixed while reversing the internal flow or changing deformation strength.
2. **Raymarched metaball droplets**
   - 화면: The production field definition and raymarching pass beside the separate contact or proximity logic.
   - 동작: Move two field sources together, show the fusion, and identify how interaction is evaluated.
3. **Authored cloud growth targets**
   - 화면: The Maya target states, their shared topology, and their actual Unity control.
   - 동작: Move through the authored states and distinguish that process from procedural shader deformation.

### Fall of Minds

1. **Ambient sound input**
   - 화면: The actual audio input and the control values extracted from it.
   - 동작: Record quieter and busier input without changing the visual configuration.
2. **Audio-to-visual response**
   - 화면: The actual value-to-visual mapping and the scene parameters it changes.
   - 동작: Keep the incoming control value and visible response together during a clear sound change.
3. **Public-display integration**
   - 화면: The running visual scene and its real display context.
   - 동작: Capture the sound environment and screen together so the input-to-response relation is observable.

### Algorithm of Flowers and Grammar of Waves

1. **VFX Graph particles**
   - 화면: The actual graph and the particle setup used for one documented scene.
   - 동작: Show the graph beside the corresponding Game view while changing one existing control.
2. **Shader treatment**
   - 화면: The material and shader controls beside the relevant VFX Graph stages.
   - 동작: Compare the same scene with one treatment changed while keeping the remaining setup fixed.
3. **Moving-image series for a media wall**
   - 화면: The production scene and the settings associated with two existing variations.
   - 동작: Connect each Unity configuration to its corresponding documented still or sequence.

### Beads Wall

1. **Live webcam input**
   - 화면: The actual webcam source and the image passed into the visual stage.
   - 동작: Move through the camera frame and pause so source updates are easy to identify.
2. **Webcam-to-VFX Graph mapping**
   - 화면: The graph input binding and the stages that affect particle appearance or placement.
   - 동작: Show source, graph, and final display together while one person moves across the frame.
3. **Readable live feedback**
   - 화면: Particle and material controls beside the installed output.
   - 동작: Use a clear movement, a still pose, and a departure to show what the displayed field retains or changes.

### Shininho

1. **Scan → Wrap → MetaHuman**
   - 화면: The original scan region, Wrap correspondence, transferred textures, and final MetaHuman.
   - 동작: Show the same face angle at source, wrapped, and final Unreal stages.
2. **Body & facial performance**
   - 화면: A solved capture clip, one corrected tracking artifact, and the retargeted character.
   - 동작: Keep the source and corrected motion aligned so the change can be inspected.
3. **Unreal performance assembly**
   - 화면: Sequencer body and face tracks, their timing alignment, and the final MetaHuman playback.
   - 동작: Play one aligned take with Sequencer and the character visible together.

### AI Choi Jung-hoon

1. **Character Creator 4 → Unity**
   - 화면: Microphone input, recognized text, the request, and the returned response.
   - 동작: Keep one spoken question and its generated reply in an uncut recording.
2. **Spoken GPT conversation**
   - 화면: The generated audio, playback state, and actual facial-animation controls.
   - 동작: Show the response text alongside the audible reply and the character's facial movement.
3. **Facial blendshape playback**
   - 화면: The character hierarchy, presentation scene, and components coordinating a conversational turn.
   - 동작: Show the resting character, an incoming turn, its performed response, and the implemented return to the next interaction.

### AI Gang Se-hwang

1. **Unity HDRP character integration**
   - 화면: The character hierarchy, material assignments, lighting, and Game view.
   - 동작: Show the same character in Scene view and the final camera view.
2. **Animation integration & character playback**
   - 화면: The actual animation-control setup, imported clips or performance data, and facial controls.
   - 동작: Trigger one implemented performance and show the character's body and face during playback.
3. **Museum docent interaction**
   - 화면: The actual interaction trigger and the scene response used by the museum application.
   - 동작: Record a visitor-facing action, its Unity response, and the installed screen in one sequence.

### Track 6

1. **Kinect v2 input**
   - 화면: The tracked-body data and the scene component that consumes it.
   - 동작: Keep the participant, tracked body, and geometric response in the same recording.
2. **Body-to-geometry mapping**
   - 화면: The actual movement-to-geometry controls and their affected scene objects.
   - 동작: Repeat one movement through two existing visual mappings and keep the difference visible.
3. **Six-track audiovisual scene**
   - 화면: The existing track-control mechanism and the visual setup associated with it.
   - 동작: Show a real track change and the corresponding presentation without assuming an unverified synchronization algorithm.

### Fineo, Translated Universe

1. **Data-to-form translation**
   - 화면: One source entry, its actual generation parameters, and the resulting object.
   - 동작: Compare two elements while keeping the visualization rule consistent.
2. **Unity world construction**
   - 화면: The generated forms in the Unity scene and their organization into a larger environment.
   - 동작: Move from a single form to the surrounding group without changing its identity.
3. **VR presentation**
   - 화면: The VR viewing setup and the scene as experienced from the participant's position.
   - 동작: Record navigation from one generated form to its surrounding spatial relationships.

### NARCI / Be NARCI

1. **Hand-tracked input**
   - 화면: The hand-input component, its event binding, and the receiving object or script.
   - 동작: Perform one gesture slowly and show the corresponding event and visible response together.
2. **Scene & material responses**
   - 화면: The affected object and material beside the component that changes their state.
   - 동작: Show the same object before, during, and after one accepted interaction.
3. **Paired VR encounters**
   - 화면: The two scene setups and the objects that receive participant input in each.
   - 동작: Record each experience separately so their different interaction rules remain visible.
## 생성 참고 이미지의 출처와 프롬프트

내장 이미지 생성 도구를 사용했습니다. 생성 이미지는 실제 작품의 복제나 Unity 실행 기록이 아닙니다.

- `assets/reference/shader-reference.png` / 프롬프트: `assets/reference/shader-reference-prompt.txt`
- `assets/reference/painting-reference.png` / 프롬프트: `assets/reference/painting-reference-prompt.txt`

이 두 이미지의 캡션과 `reference` 표기는 실제 작품 캡처로 교체할 때만 함께 바꿉니다.

## 검증 범위

HTML·링크·앵커와 이미지 파일을 정적으로 검사하고 데스크톱·모바일 브라우저 레이아웃을 확인합니다. 이 작업은 Unity 컴파일·Quest 실행·성능 측정·사용자 연구를 새로 검증한 것이 아닙니다.

## 이번 기술 수정에 사용한 제작 자료

- AI ZOO: https://jonghoonahn.com/detail_pages/interactive_4.html
- To Eternity: https://jonghoonahn.com/detail_pages/interactive_1.html
- Silhak Dance: https://jonghoonahn.com/detail_pages/interactive_7.html
- Jemulpo Photo Studio: https://jonghoonahn.com/detail_pages/interactive_3.html
- Escape Metro: https://jonghoonahn.com/detail_pages/xr_4.html
- Graffiti Freedom: https://jonghoonahn.com/detail_pages/xr_5.html
- Erick Oh game collaboration: https://jonghoonahn.com/projects7/erick-oh-real-time-graphics.html
- Fall of Minds: https://jonghoonahn.com/detail_pages/media_3.html
- Algorithm of Flowers and Grammar of Waves: https://jonghoonahn.com/detail_pages/flower-of-waves.html
- Beads Wall: https://jonghoonahn.com/detail_pages/interactive_10.html
- Shininho: https://jonghoonahn.com/projects/shininho-jooan.html
- AI Choi Jung-hoon: https://jonghoonahn.com/detail_pages/interactive_9.html
- AI Gang Se-hwang: https://jonghoonahn.com/detail_pages/interactive_2.html
