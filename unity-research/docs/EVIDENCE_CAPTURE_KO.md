# Unity 포트폴리오 증거 촬영 가이드

새 코드의 상태는 '이번에 소스 구현'이다. Unity 컴파일, 실행, Quest 검증 완료로 적으면 안 된다. 원본 프로젝트 촬영과 독립 예제 촬영을 구분한다.

## 우선 제작 순서

1. Context Gate를 별도 Unity 프로젝트에 가져와 컴파일한다. Console 오류를 해결하고 버전을 기록한다.
2. 제물포 또는 Erick Oh 원본에서 공개 가능한 기술 캡처를 확보한다.
3. Escape Metro에서 대화와 진행 조건이 연결되는 한 장면을 확보한다.
4. Context Gate의 paired 조건, 타임아웃, reset, 파일 내보내기를 한 번의 연속 녹화로 남긴다.
5. 실제 desktop build와 로그를 함께 보관한다. 연구 질문에 XR 입력이 필요할 때 Quest 어댑터를 추가한다.

## 공통 촬영 원칙

- 1080p 이상, 글자가 읽히는 크기로 녹화한다. 자동으로 60fps나 성능 향상을 주장하지 않는다.
- Game view만 찍지 말고 관련 Inspector와 실제 상태값을 함께 보여준다.
- 45–90초의 연속 동작을 우선한다. 어떤 입력이 어떤 상태와 출력을 바꿨는지 추적 가능해야 한다.
- 제작일, Unity 버전, 플랫폼, 사용한 코드 버전을 영상 설명에 남긴다.
- 클라이언트 코드, 계정, 주소, 키, 방문자 얼굴 등 공개할 수 없는 정보는 제외한다.
- 비공개 작업은 같은 원리를 분리한 독립 예제를 촬영하고 화면에 Independent example이라고 표시한다.
- 새 소스의 파일 존재와 원본 프로젝트의 실제 구현은 별개의 증거다.

## Erick Oh

필요 화면:
- Game view와 제어 대상의 Transform.
- 원본 C# 제어 컴포넌트 또는 이번 ShaderFlowController Inspector.
- flow 방향, intensity, amplitude.
- 원본 성장 상태의 Maya 형태와 Unity 대응 제어.

녹화 동작:
1. 물체 Transform을 고정한다.
2. 내부 필드 방향을 바꾼다.
3. intensity와 amplitude를 바꾸고 어떤 출력이 변했는지 보여준다.
4. 성장 상태를 순서대로 전환한다.
5. 원본에서 허용되면 시각적 필드와 충돌 / 근접 판정을 따로 보여준다.

권장 파일: erick_01_runtime_parameters.mp4, erick_02_growth_states.mp4.

현재 Maya 이미지와 기존 영상은 활용 가능하다. 이 이미지를 Unity Editor 캡처라고 부르지 않는다. 전후 성능 수치가 없으면 최적화 성공 수치를 넣지 않는다.

## 제물포 사진관

필요 화면:
- 실제 입력 / 촬영 프로그램.
- Unity의 참가자 구분과 처리 상태.
- Python/OpenCV 프로세스의 처리 완료.
- 원본 네트워크 송신 / 수신 부분.
- 저장 폴더와 전시 벽면의 출력.

녹화 동작:
1. 새 참가자 입력부터 벽면에 나타날 때까지 끊지 않는다.
2. 같은 결과를 구분할 수 있는 식별자나 시각적 표시를 유지한다.
3. 가능한 범위에서 동시 참가 구조를 보여준다. 최대 4명은 전시 시스템의 범위이며 온라인 게임 운영 경험으로 바꾸지 않는다.
4. TCP와 UDP 각각의 역할은 실제 코드 / 설정으로 확인한 후 설명한다.

독립 TCP 예제:
1. 정상 PNG 전송.
2. --chunk-size 7로 패킷을 잘게 나눠 전송.
3. --disconnect-after 40으로 일부만 보낸다.
4. 불완전 데이터가 이전 이미지를 덮어쓰지 않는지 확인한다.
5. 연결 중 receiver disable / enable과 포트 재사용을 확인한다.

이 예제는 한 명의 sender만 처리한다. 원본 4인 시스템을 재현했다고 쓰지 않는다.

권장 파일: jemulpo_01_end_to_end.mp4, jemulpo_02_process_boundary.mp4.

## Escape Metro / RedFlight AI

두 이름은 같은 프로젝트다. 프로젝트 수를 부풀리지 않는다.

필요 화면:
- 실제 VR 시점.
- NPC 대화 상태와 퍼즐 상태.
- 입력, 응답, 진행 조건, 문 / 장면 변화.
- 공개 가능한 원본 C# 또는 이번 독립 NpcProgressGate.

녹화 동작:
1. 일반적인 질문과 응답을 보여준다.
2. 실제 퍼즐 조건을 만족하는 상호작용을 보여준다.
3. 조건이 변하는 순간을 Inspector와 함께 기록한다.
4. 독립 예제에서는 지난 turn 응답, reset 이전 epoch 응답, 잘못된 cue를 넣어 거절을 확인한다.

과거 문서의 WebSocket, STT 방식, 최적화 설명을 실제 원본 확인 없이 확정하지 않는다.

권장 파일: metro_01_dialogue_to_progression.mp4, metro_02_stale_reply_example.mp4.

## Context Gate

필요 화면:
- Settings.asset의 seed, pairs, delay, request timeout, trial timeout.
- Game view와 ExperimentRunner 상태.
- 세션 출력 폴더와 JSONL / CSV / JSON.
- Test Runner 결과.
- 실제 desktop binary.

녹화 동작:
1. 세션을 시작하고 기본 조건에서 hint를 요청한다.
2. hint가 오기 전에 해당 물체를 옮긴다.
3. baseline에서 적용 불가능한 안내가 표시되는지 확인한다.
4. paired 조건으로 넘어가 같은 초기 상태를 확인한다.
5. 같은 동작 후 Revalidate가 안내를 버리고 이유를 기록하는지 확인한다.
6. 관련 없는 물체만 옮겼을 때 적용 가능한 안내가 유지되는지 확인한다.
7. pending 상태에서 reset하여 이전 요청이 취소되는지 확인한다.
8. timeout과 malformed 응답을 주입한다.
9. 세션을 종료하고 세 파일의 이벤트를 비교한다.
10. validator를 실행하고 그 출력도 보관한다.

권장 파일: contextgate_01_conditions.mp4, contextgate_02_failure_paths.mp4, contextgate_03_inspector.png, contextgate_04_test_runner.png.

현재 코드에는 XR 입력 어댑터와 Quest UI가 없다. Quest에 설치해 실제로 실행하기 전에는 Quest 완료나 손 추적 완료로 표시하지 않는다.

## 보조 작업

- NARCI: 손 인식 → 실제 이벤트 → 상태 변화 → 손이 시야를 벗어난 뒤 복구. 두 작품은 각자 찍는다.
- Graffiti Freedom: 입력, 파티클, hit / UV 진단, RenderTexture, 벽 재질을 함께 보여준다. 저장 기능은 원본 확인 전 제외한다.
- AI ZOO: 입력, 제어 메시지, 음성 / 빛 / 모터 출력을 함께 찍는다. 중단과 초기화도 확인한다.
- 강세황: Unity rig / Animator, 실제 trigger, animation transition, 설치 화면을 연결한다.
- Shininho / Jooan: Unreal / MetaHuman 자료로 표시한다.

## 성능을 주장하려면

비교 대상, 동일 장면, 코드 전후 버전, 하드웨어, Unity / 패키지 버전, 해상도, graphics API, profiler trace를 함께 보관한다. 측정이 없으면 수치를 만들지 않는다.
