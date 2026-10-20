# PlayStation 2027 두 직무 — 100점 목표 제작 로드맵

**지원자:** Jonghoon Ahn  
**대상 직무:** Insomniac Accessibility Intern (Master's or PhD) / PlayStation Game Service ML Intern (PhD)  
**상태:** 기획 및 포트폴리오 상세페이지 작성 완료. 실제 게임 빌드, 사람 대상 연구, 새 ML 학습·평가 결과는 추후 제작 필요.  
**연결:** [Accessibility](./accessibility.html) · [ML](./ml.html) · [공통 진입 페이지](./index.html)

> **중요:** 아래의 ‘100점’은 채용 합격 확률이나 실제 평가점수가 아니다. 면접관 A(기술), B(채용), C(팀장)의 질문을 빠짐없이 커버하기 위한 내부 포트폴리오 완성 기준이다. PlayStation의 공식 평가표가 아니다.

## 0. 공고별 직접 요구

### Accessibility: Insomniac Games

공식 직무: 접근성 기능 디자인, 문서화/네이밍·네비게이션, UI/UX 와이어프레임 피드백, 게임플레이 장벽 발견과 보고, 장애 관련 필요를 공개한 게이머/컨설턴트와 포용적 리서치, 설문·영상·관찰·텔레메트리 분석, 결과 전달. 특정 내부 PAS 문서는 접근권한 없이 준수 인증을 주장하면 안 됨.

**기존에 있는 증거:** Escape Metro(Unity VR), AI ZOO(멀티모달 인터페이스), Shininho(캐릭터·VR 파이프라인), [Signal Path 웹데모](./accessibility-lab.html). 이것들이 접근성 사용자 연구의 성과를 증명하는 것은 아님.

### Machine Learning: Global R&D / Game Service ML

공식 직무: gameplay video/audio/controller input을 활용한 비정상 플레이·버그/글리치 탐지, self-supervised/contrastive/state-space/multimodal/VLM research, 재현 가능한 실험과 generalization 평가, 프로토타입, 논문 잠재력.

**기존에 있는 증거:** NeuralScene Bench(2개 scene의 held-out PSNR/SSIM/LPIPS), HUGS deformation locality(3개 독립 체크포인트, 2개 관절, 36 nested diagnostics), [Synthetic anomaly lab](./anomaly-lab.html), [Python baseline](./experiment/baseline.py). 기존 기초 연구를 game QA 모델 성능으로 잘못 적으면 안 됨.

## 1. 4개 프로젝트와 기획 역할

| 구분 | 페이지 | 신규 프로젝트 핵심 | 제출 시 우선순위 |
|---|---|---|---|
| A1 | [SignalForge](./signalforge.html) | 실전 3D 보스 패턴에 다양한 읽기·입력·편안함 설정, 참여자 피드백과 개선 | **Accessibility 대표 구현 1순위** |
| A2 | [Escape Metro Inclusive Dialogue](./escape-metro-inclusive.html) | 기존 VR 게임을 텍스트/인텐트 입력, 기록·복구, 시트/데스크톱 옵션으로 개조 | A1 이후 증거 증강 |
| M1 | [FrameFault](./framefault.html) | Unity에서 실제 버그 주입/기록, 영상+입력+상태 동기화, PyTorch 베이스라인·퓨전, held-out 평가 | **ML 대표 구현 1순위** |
| M2 | [IntentGraph](./intentgraph.html) | 플레이어 액션 조건부 시계열 모델, 의도적 이례 동작 vs 오류, 단일 변경 replay 실험 | M1 수집 기반 공유·후속 연구 |

**이름 참고:** PlayStation의 실제 ML 조직 소개에 ‘GameLens’라는 팀 이름이 등장하므로 신규 개인 연구 프로젝트는 혼동 방지를 위해 **FrameFault**로 명명한다.

## 2. 접근성 100점 내부 심사표

| 배점 | A/B/C의 핵심 질문 | 반드시 보여줄 증거 |
|---:|---|---|
| 20 | 어떤 구체적 **플레이 장벽**을 발견했는가? | 실제 시연 영상, 재현 조건, 영향과 가설을 분리한 버그/UX 리포트 |
| 20 | 대안을 정말 **게임에서 구현**했는가? | Unity build, 설정 메뉴, 여러 큐 방식, 컨트롤 바인딩, 버전 정보 |
| 20 | 실제 게이머의 접근성 요구를 **경청하고 조사**했는가? | 적절한 동의/접근 방식, 실제 참여 또는 전문가 검토, 비식별 관찰 및 한계 |
| 15 | 변경이 **문제를 줄였다는 관찰 결과**가 있는가? | before/after 영상, 수행·회복 지표, 반례, 분모가 있는 수치 |
| 15 | 개발팀에 **전달 가능한 문서**인가? | 우선순위, 이슈 리포트, 와이어프레임, 구현 명세, 재테스트 결과 |
| 10 | 제품 경험·접근성 세부 품질을 챙겼는가? | 입력/색상/소리 의존성 검사, UI focus, 명확한 안내, 옵션 저장 |
| **100** | 공식 점수가 아니라 프로젝트 내부 목표 | **증거 없는 항목에는 점수를 주지 않음** |

### A1 — SignalForge: 정확한 제작 범위

1. Unity 3D **1개 아레나**, 조작 가능한 캐릭터 **1종**, 적 **1종**, 3가지 telegraph 패턴(radial slam / directional sweep / projectile burst).
2. 기본 모드의 attack wind-up → active → recovery를 타임라인으로 정의. 피해 판정은 presentation effect와 독립적으로 유지.
3. 의미 단위 **ThreatEvent**를 생성하고 visual, caption, audio, 가능한 경우 haptic에 각각 매핑. 음소거/색각·대비 설정에서 위험 정보가 사라지지 않도록 설계.
4. Unity Input System rebinding, 다양한 메뉴 조작 방식, 온보딩, 비타이머형 연습 모드, VFX 강도, 카메라 흔들림, 동작 축소 설정.
5. 레벨/seed/attack timing을 재생 가능한 시퀀스로 고정해 조건별 비교.
6. 이벤트 로거: trial, 입력, attack ID, cue profile, hit/dodge, prompt usage, reason for failure, timestep. 불필요한 개인정보 배제.
7. 실제 참가자나 전문 컨설턴트의 검토를 **직접 진행한 경우에만** 참가자 연구로 표기. 피드백 충돌, 표본 한계, 만족도와 성능 측정의 차이를 정직하게 기록.

**최소 출고 조건:** 60초 완결 가능한 액션 루프, 설정이 실제 플레이에 반영됨, 같은 공격 sequence의 before/after 영상 1개, barrier issue log 5개 이상(직접 발견한 경우만), 실제 테스트 결과 1회 이상(수행할 수 있을 때). 마지막 두 항목이 없으면 '테스트 전 설계'로 표기.

### A2 — Escape Metro Inclusive Dialogue: 정확한 제작 범위

1. 기존 Unity VR 프로젝트의 실제 소스에서 브랜치 분기.
2. `NPCProvider`를 **고정 transcript fixture**와 live LLM provider로 분리. 모델 응답과 gameplay win-state 별도 관리.
3. 최소 keyboard text, 선택 가능한 intent card, persistent transcript, 복구 가능한 task recap.
4. VR과 desktop에서 동일한 password goal을 해결하게 설계. 동작·멀미 모드, 짧은 자막, 리바인딩 포함.
5. 사용자 인터뷰/플레이테스트 전에는 '설계안'으로 표현. live LLM 비교시 nondeterminism을 명확히 표기.

**최소 출고 조건:** VR 또는 desktop 중 한 플랫폼이라도 입력 2개 이상으로 같은 결말 도달, 고정 fixture의 regression test, UX flow 비교 및 재현 가능한 capture.

## 3. 머신러닝 100점 내부 심사표

| 배점 | 연구 질문 | 반드시 보여줄 증거 |
|---:|---|---|
| 15 | 반증 가능한 가설과 경쟁 baseline이 분명한가? | H1/H2 사전명시, 클래스별 기대 실패 |
| 20 | 데이터와 라벨이 건전한가? | rights-safe game footage, sync, ontology, run-level splits, 모호한 부분 정책 |
| 20 | **직접 훈련한** ML 모델이 있는가? | PyTorch 코드, weight/log/config, frozen video backbone + temporal/fusion heads |
| 20 | 실험으로 모델 특성을 검증했는가? | video/action/fusion ablation, hard negatives, cross-scenario evaluation, uncertainty |
| 15 | 실제 QA 비용을 고려했는가? | event-level recall, false alerts/hour, onset latency, false-positive 사례 |
| 10 | 다른 연구자가 따라할 수 있는가? | dependency lock, seed, manifest, 수치 재현, paper-style technical report |
| **100** | 공식 점수가 아닌 프로젝트 내부 목표 | **데이터 미수집·미학습의 가상 실험 수치 금지** |

### M1 — FrameFault: 정확한 제작 범위

- 원본 Unity 샘플 빌드에서 정상 gameplay video, time-aligned input and engine-state trace 캡처.
- 게임 오류 **6종**: movement stall, illegal teleport, collider violation, delayed/wrong input response, animation-state mismatch, progression softlock.
- **Hard negative**: legal dash, scripted teleport/respawn, camera cut, pause/menu, hit-stop, stun/knockback, harmless irregular play.
- 데이터 세트와 라벨은 frame 및 event 수준으로 구분. 반드시 run/scene/seed 단위로 train/val/test 분리하고 leakage audit 수행.
- Baseline **B0**: rule-based, **B1**: frozen video embedding + temporal head, **B2**: input/state-only temporal model, **B3**: fusion. 고성능 VLM은 B0-B3 완성 후 선택.
- 주요 결과: event precision/recall/macro-F1, false alarms/hour, detection delay, class-wise breakdown, session-grouped CI, memory/inference budget.
- 특히 normal unusual behavior에서 오탐을 줄이는지 보여줄 것.
- 수치는 test set을 한 번 고정한 뒤 측정. 높은 성능을 위해 테스트 세트 튜닝하지 않는다.

**최소 출고 조건:** 작동하는 Unity 버그 주입 시연, 실제 플레이 영상+입력 동기화, 최소 B0/B1/B2 결과 및 B3 1차 융합, 재현 가능한 split, 실제 confusion/error 사례. 충분한 샘플이 없으면 small-scale feasibility로 명시.

### M2 — IntentGraph: 정확한 제작 범위

- M1의 gameplay capture infrastructure를 재사용하고 **action-conditioned dynamics prediction**으로 연구 질문을 좁힘.
- D0(물리 기반), D1(state-only recurrent predictor), D2(action+state+ability-aware temporal model) 비교.
- 같은 seed + initial state + action sequence의 replay에서 **단일 변수 intervention**.
- legal dash vs unauthorized velocity spike, collision state, hit-stop, respawn 등 반례 필수.
- 표적: normal next-state forecasting, context-aware anomaly event metrics, unseen mechanic generalization, top suspected subsystem의 정확도.
- Simulator intervention의 인과 해석은 게임 엔진 내부에 한정. 일반 영상만 보고 근본 원인을 안다고 주장 금지.

## 4. 2026년 11월 20일 마감 전 시간 배분(권장)

**한 달 안에 네 프로젝트 네 개의 학습·플레이테스트까지 모두 완성하는 것은 무리일 수 있다.** 따라서 A1과 M1을 중심으로, A2와 M2는 관련 검증 가능한 첫 기능 또는 계획된 follow-on case로 유지한다.

| 기간 | 주 작업 | 통과 조건 |
|---|---|---|
| 10/20–10/24 | Unity 샘플 2개 구조: SignalForge 공격 패턴, FrameFault 움직임/버그 주입 | 게임 화면·입력·로그 모두 연결됨 |
| 10/25–10/31 | A1 대체 큐/설정 구현, M1 실제 capture 및 6개 버그 라벨 스키마 | 각 프로젝트 45초 데모, 정상/오류 로그 |
| 11/01–11/07 | A1 사용성 전문가/자발적 피드백, M1 B0/B1/B2 훈련·평가 | 첫 문제 발견 기록, 첫 진짜 측정값 |
| 11/08–11/13 | A1 비교·재수정, M1 fusion B3·ablation·hard negatives | 한 번에 추적 가능한 evidence table |
| 11/14–11/18 | 최종 영문 서술, 상세페이지 실제 실험자료 교체, 2개 맞춤 이력서 | 재현성·과장·오탈자·링크·모바일 검수 |
| 11/19–11/20 | 지원 자격 확인 후 제출 | 정확한 예상졸업일, 근무 가능 기간, 접수 확인 |

학생 신분과 실제 연구계획을 감안하면 시간·학업 부담에 따라 일부 게이트를 이후로 이월할 수 있다.

## 5. 첫 제작 순서 — 시작하는 날 바로 할 일

### 접근성 첫날
- 새 Unity 프로젝트. 이동·카메라·회피 키를 갖춘 캐릭터와 TelegraphSO 구현.
- 세 가지 공격 패턴을 **텍스트 로그로 먼저** 구분.
- 공격 상태를 `WindUp/Active/Recovery`로 완전히 분리.
- 동일 seed에서 리플레이 가능한 보스 시퀀스 생성.
- 영상에서 UI cue를 켜고 끈 A/B 샘플 녹화.

### ML 첫날
- 별도 Unity 샘플 또는 같은 게임에서 state와 controller input을 frame timestamp로 기록.
- 의도적 movement stall 1종을 Toggle하여 **같은 조작에서 정상/오류** 2개 replay 기록.
- 영상 timestamp와 CSV timestamp를 단일 모노토닉 기준으로 정렬.
- Python에서 temporal window 생성과 label QA 출력.
- B0 residual baseline을 실제 capture에 적용; 기존 [synthetic script](./experiment/baseline.py) 결과와 혼합하지 말 것.

## 6. 제출 전 정직성·자격 점검

- **현재 발표된 공고의 졸업일 조건:** 2026년 5월 ~ 2029년 12월 예상 졸업.
- 현재 2030년 예상이라면 2029년 조기졸업 계획이 실제로 합리적인지 MAT advisor와 논의해야 한다. 계획·지원서·공식 기록 사이에 모순을 만들지 말 것.
- 실제 플레이테스트를 진행한 적 없다면 `designed study protocol`로 표기.
- Unity에서 아직 빌드하지 않았다면 `planned Unity build`로 표기.
- B3를 학습하지 않았다면 `proposed fusion model`로 표기.
- 장애인의 삶을 기능 체크리스트로 환원하거나 특정 집단을 대변한다고 말하지 말 것.
- 본인이 제작·기여한 범위만 기술. Sony/Insomniac 내부 과제처럼 브랜딩하지 말 것.
- 4개 제안 프로젝트는 기존 프로젝트를 없애지 않는다. **기존 실무 경험 + 실제 연구 결과 + 새 역할 특화 개발** 순서로 제시.

## 7. 전용 상세페이지

- [SignalForge — Combat Accessibility Lab](./signalforge.html)
- [Escape Metro — Inclusive Dialogue](./escape-metro-inclusive.html)
- [FrameFault — Multimodal Gameplay Anomaly Research](./framefault.html)
- [IntentGraph — Counterfactual Gameplay Dynamics](./intentgraph.html)

2026-10-20 초안. 실제 구현·재현성 검증·정당한 연구윤리에 따라 계속 갱신.
