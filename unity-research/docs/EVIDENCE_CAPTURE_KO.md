# 전체 작품의 기술 증거 촬영 가이드

15개 작품의 설명을 보완할 실제 촬영 지시서다. 원본 프로젝트와 이번 독립 예제는 구분한다. 새 C# 파일의 존재만으로 Unity 실행이 검증됐다고 표시하지 않는다.

## 공통

- 45–90초의 연속 동작을 우선한다. 입력과 처리 상태, 출력의 관계가 읽혀야 한다.
- Game view와 관련 Inspector, 센서·오디오·텍스처 진단 화면을 함께 보여준다.
- 실제 Unity 버전, 플랫폼, 코드 버전과 촬영일을 남긴다.
- 비공개 소스는 제외하고 공개 가능한 독립 예제에는 Independent example이라고 적는다.
- 아래 동작은 추가 캡처 계획이다. 아직 찍지 않은 화면을 원본 제작 자료처럼 표시하지 않는다.

## 작품별 필수 캡처

| 작품 | 함께 보여줄 화면 | 실행할 동작 |
| --- | --- | --- |
| 꽃의 알고리즘과 파도의 문법 | VFX Graph, 노출 파라미터, 셰이더, Game view | 알아볼 수 있는 풍경에서 입자가 흩어지는 범위까지 한 값씩 변경. 미디어월 영상은 별도 표시 |
| To Eternity | Azure Kinect 입력, Unity 이벤트, Timeline playhead | 몸 입력이 실제 시퀀스와 합성에 반영되는 순간과 다음 참가자 준비 상태 |
| AI 강세황 | Unity HDRP 캐릭터, rig/Animator 또는 실제 제어 컴포넌트 | 하나의 상호작용이 실제 animation transition과 최종 디스플레이로 이어지는 흐름 |
| 제물포 사진관 | Barracuda 모델과 입출력 텍스처, OpenCV/필터, 최종 합성 | 같은 얼굴로 처리 단계별 결과를 비교. 네트워크 배포와 참가자 구분은 별도 캡처 |
| AI ZOO | 손 입력 또는 대화, 응답 제어값, Arduino 연결, 서보·음성·빛·얼굴 | 한 입력이 실제 장치와 디지털 휴먼에 전달되는 순서. 구현된 초기화와 중단 동작 |
| 실학댄스 | Kinect v2 추적과 Unity 캐릭터 | 같은 몸 동작의 입력과 캐릭터 대응. 사람이 들어오거나 나가는 경우 |
| Track 6 | Kinect v2 입력, 기하학적 표현, 음악 상태 | 동일 동작을 실제 시각 매핑에 연결. 예술적 왜곡과 물리 시뮬레이션을 구분 |
| Beads Wall | 웹캠 원본, VFX Graph 매핑, 입자 출력 | 시야를 통과하고 멈추는 동작. Kinect를 사용한 것으로 임의 설명하지 않음 |
| AI 최정훈 | 마이크/인식 텍스트, GPT 응답, TTS, 얼굴 재생 | 하나의 완전한 구두 대화 turn. 실제 Unity sequence/coroutine 제어 |
| Fall of Minds | 실제 오디오 입력과 제어값, 비주얼 | 같은 시각 설정에서 조용한 소리와 큰 소리를 입력. FFT 등 분석 방식은 실제 코드로 확인 |
| Fineo | 실제 데이터 한 항목, 생성 파라미터, 형상, Unity 공간 | 데이터에서 형상과 VR 배치로 이어지는 한 예. 원본 매핑을 확인하기 전 방정식을 단정하지 않음 |
| Escape Metro | NPC 대화, 퍼즐 조건, 월드 변화 | 평범한 질문과 유효한 단서 획득을 비교. 비밀번호와 진행 조건의 실제 연결 |
| NARCI / Be NARCI | 손 추적 이벤트, 씬 상태, 재질 변화 | 두 경험을 따로 촬영해 가능한 행동을 비교. 회복 의도를 치료 효과로 표현하지 않음 |
| Graffiti Freedom | 입력, 파티클, hit/UV 진단, RenderTexture, 벽 재질 | 뿌리다가 멈춰 파티클과 남은 흔적의 차이를 보여줌. 저장 기능은 원본 확인 후 |
| Erick Oh | C# 제어값, shader, Transform, Game view | 필드 방향과 강도 변경, 물방울 metaball 결합, 별도 contact/proximity 상태 |

## 새 독립 예제와 Context Gate

- ShaderFlowController / ResponsiveField는 원본 고객 코드가 아니다. 충분히 분할된 메시, URP 재질, 필드 방향·강도 조절을 보여준다.
- PortraitInbox는 한 sender용 TCP 경계 예제다. 정상 전송, --chunk-size 7, --disconnect-after 40을 비교한다. 원본 네 사람의 전시 시스템으로 부르지 않는다.
- NpcProgressGate는 turn/epoch가 다른 응답을 거절하는 새 예제다. 원본 Escape Metro가 같은 구현이었다고 쓰지 않는다.
- Context Gate는 Settings, Game view, 세션/trial 상태, CSV/JSONL/JSON을 함께 보여준다. 동일한 변경 뒤 baseline과 Revalidate, 관련 없는 물체 변경, reset, timeout, malformed 응답을 기록한다.
- Unity Test Runner와 실제 desktop build를 먼저 검증한다. 현재 새 코드에는 Quest 입력과 UI 검증이 없다.

## 성능 비교

성능을 주장하려면 같은 장면과 입력, 전후 코드, 하드웨어, Unity/패키지 버전, 해상도, graphics API, profiler trace를 남긴다. 없는 FPS·지연·운영 안정성 수치를 만들지 않는다.
