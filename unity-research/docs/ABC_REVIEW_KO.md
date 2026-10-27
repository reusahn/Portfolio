# A·B·C 가상 검토와 실제 수정 기록

27 October 2026. A는 Tobias Höllerer의 공개 연구를 바탕으로 한 가상 PI 관점, B는 Four Eyes Lab에서 함께 일할 가상의 포닥 관점, C는 Unity·XR 구현 전문가 관점이다. 실제 교수나 연구실 구성원의 발언·평가·추천·채용 의사가 아니다.

각 관점은 변경 전에 5개 항목, 항목당 20점의 편집 루브릭을 정했다. 구현 후 같은 기준으로 독립 재검토했다. 100점은 포트폴리오의 설명·근거·협업 제안·인수인계 체크리스트가 닫혔다는 뜻이다. 실제 Unity 실행 준비도는 별도로 남긴다.

## 최종 결과

| 관점 | 최초 | 최종 | 평가 범위 |
| --- | ---: | ---: | --- |
| A / 공개 연구에 근거한 PI 관점 | 72/100 | 100/100 | 연구 적합성, 개인 기여, 검토 가능한 근거, 연구 판단, 첫 협업 |
| B / 가상 포닥 협업자 | 65/100 | 100/100 | 인터페이스, 실험 경계, 재현 안내, 데이터 무결성, 읽기 동선 |
| C / Unity·XR 전문가 | 76/100 | 100/100 | 출처·역할, 기술 경계, 실패 판단, 재현·인수인계, 정보 순서 |

A와 B의 실제 Unity 실행 평가는 보류다. C가 별도로 평가한 이번 새 연구용 소스의 실행 증거 점수는 38/100으로 유지했다. 이 점수는 안종훈의 전체 개발 경력 평가가 아니다. C# 컴파일, 실제 로그, 데스크톱 빌드, 기기 실행과 독립 재현 기록이 추가되어야 올라간다.

## 정리된 가상 편집 대화

다음은 세 검토 문서와 후속 검토를 대화 형식으로 정리한 것이다. 각 원문과 점수 근거는 아래 링크에 보존했다.

### Round 1 — What should a lab member inspect first?

**A:** “I need a component I can assign, not fifteen equally weighted research pitches. Lead me to sensor-to-sequence work, visual-feedback controls, and the one operationalized instrument.”

**B:** “Fineo is an interesting world. I still need to see the author’s implementation boundary. To Eternity is a clearer conversation about a live input entering an authored task.”

**C:** “Keep the two-column catalog and all fifteen works. Add short implementation entry points. Replace the same abstract implementation heading on every case with the mechanism actually built.”

**Decision:** The home keeps only “Unity-based projects” as its heading. A compact inspection route links To Eternity, Erick Oh, and Context Gate. The XR group starts with NARCI, then Escape Metro, Fineo and Graffiti. Fifteen works remain visible.

### Round 2 — What would we ask Jonghoon to own?

**A:** “A bounded Unity interaction or rendering adapter is credible. XARP is a motivating context, but compatibility must not be claimed before an actual integration.”

**B:** “Tell me what you own, what we choose together, and which artifacts decide acceptance. I want a source revision, settings, raw logs and a recording that agree.”

**C:** “Show a design decision, a failure case to exercise, observable evidence and the reuse boundary. A planned diagnostic is not a historical incident.”

**Decision:** handoff.html specifies one technical spike continuing Context Gate, two candidate contribution directions, the Unity ownership boundary, lab decisions, deliverables and acceptance checks. Four existing cases receive a concrete engineering review. No second prototype is added.

### Round 3 — Can we trust the evidence pipeline?

**B:** “The checker accepts a moved object in an epoch that never started. I reproduced this with a synthetic three-event input. That is a real checker defect, not a Unity result.”

**C:** “Journal construction can leak writers if the CSV header write fails. The paused UI countdown also keeps decreasing. Fix those source paths and keep their runtime verification pending.”

**A:** “The repairs matter because they make failure reviewable. Keep application processing timestamps separate from physical display-onset measurement.”

**Decision:** The Python checker now enforces session, trial and request lifecycles, handles valid incomplete prefixes and compares CSV fields. Its 66 synthetic tests pass. EventJournal initialization cleanup and the paused countdown are repaired in source release 0.1.1. C# validation remains static.

### Round 4 — Can a teammate reproduce the next check?

**B:** “The runbook must name the working directory and use --csv when it promises JSON/CSV agreement.”

**C:** “The manifest must match the downloaded source. A hash proves identity, not execution.”

**A:** “One task, a declared environment, an expected trace, a reset path and explicit acceptance are enough for a first technical conversation.”

**Decision:** The commands were corrected and the bundle regenerated. The ZIP contains 30 entries. The manifest hashes 29 payload files and excludes itself. The actual offline test log is supplied. The next Unity run has a fillable acceptance record.

### Round 5 — Same rubric, final review

**A:** “The five editorial gates are closed. 100/100 for the research proposal and collaboration package. Execution readiness stays pending.”

**B:** “The revised commands and downloaded contents match the stated contract. 100/100 for the inspectable handoff package. No Unity run is implied.”

**C:** “The concrete boundaries, diagnostic checks, manifest and ownership labels close the communication checklist. 100/100 for editorial and technical communication. The separate execution evidence score remains 38/100.”

## 실제로 변경한 것

- 대문: 2열, 15작품, 간결한 제목을 유지하고 구현 검토 진입점을 추가.
- 상세페이지: 15개 구현 제목을 작품별로 수정. To Eternity, Erick Oh, Escape Metro, Jemulpo에 구체적인 기술 판단과 검증 시나리오 추가.
- 협업 페이지: 맡을 수 있는 범위, 연구실과 정할 부분, 검수 기준과 인수 자료 명시.
- 코드: validator 무결성 검사, journal 생성 실패 정리, pause 표시 수정.
- 자료: 실행 계약, 인수 기록 양식, 코드 검토 기록, 소스 해시, 실제 Python 테스트 로그.

## 다음 실제 증거

1. 새 소스를 Unity에서 clean import / compile하고 실제 Editor 및 데스크톱 동작을 기록한다.
2. 같은 요청의 적용 / 무효화 / 취소 / timeout / reset / pause / abort를 실행한다.
3. 실제 JSONL·CSV·JSON을 보존하고 checker 결과를 함께 남긴다.
4. 기존 작품 중 To Eternity 또는 Erick Oh의 입력·Inspector·출력을 함께 촬영한다.
5. 다른 사람이 runbook으로 한 시퀀스를 재현한다.

이전 프로젝트에 로깅이나 formal recovery가 있었다고 소급해 쓰지 않는다. 새 코드나 계획을 원작의 production source로 소개하지 않는다. 임상 효과, 성능 향상, 사용성 개선, 교수의 채용 의사를 만들어 쓰지 않는다.

## 독립 검토 원문

- [A 최초](reviews/review-a.md) / [A 최종](reviews/review-a-final.md)
- [B 최초](reviews/review-b.md) / [B 최종](reviews/review-b-final.md)
- [C 최초](reviews/review-c.md) / [C 최종](reviews/review-c-final.md)
- [실행 인수 기록](HANDOFF_CHECKLIST.md)
- [코드 검토](CODE_REVIEW_NOTES.md)

## 공개 연구 근거

- https://sites.cs.ucsb.edu/~holl/
- https://arxiv.org/html/2508.04108 — Unity client and limitations sections.
- https://sites.cs.ucsb.edu/~holl/pubs/Bullock-2026-IEEEVR.pdf — task and timing methods.

연구 내용과 구현 기여의 연결은 이 검토의 판단이다. 연구실의 현재 채용·펀딩 공고를 뜻하지 않는다.
