---
title: AI 코딩 에이전트와 일하는 법 — 1작업 = 1브랜치 = 1계획 문서 = 1PR
date: 2026-10-26
description: 수백 개의 PR을 AI 코딩 에이전트와 함께 머지하며 정착한 작업 절차와, 그 절차를 만들게 된 시행착오.
---

# AI 코딩 에이전트와 일하는 법 — 1작업 = 1브랜치 = 1계획 문서 = 1PR

데이터 서비스 하나를 AI 코딩 에이전트와 함께 만들었습니다. 기획과 설계, 검토와 최종 결정은 사람이 맡고, 구현과 테스트, 문서 정리는 대부분 에이전트가 맡았습니다. 몇 주 동안 수백 개의 PR이 머지됐습니다.

그 정도로 작업을 반복하고 나니, 코드를 빨리 만드는 것보다 작업의 방향을 유지하는 데 더 신경을 쓰게 됐습니다. 에이전트는 요청을 받으면 꽤 멀리까지 혼자 갑니다. 문제는 그 방향이 내가 생각한 방향과 조금 달라도, 결과물이 제법 그럴듯하게 나온다는 점이었습니다.

결국 자리를 잡은 방식은 단순했습니다.

**1작업 = 1브랜치 = 1계획 문서 = 1PR.**

처음부터 완성된 규칙은 아니었습니다. 방향을 뒤늦게 고치고, 세션끼리 서로의 변경을 되돌리고, CI가 실패한 PR을 머지하는 일을 겪으면서 하나씩 붙었습니다.

## 코드를 쓰기 전에 한 번 멈춘다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-plan-title agent-plan-desc">
<title id="agent-plan-title">계획 승인 후 구현</title>
<desc id="agent-plan-desc">요청과 현재 상태 확인 (작업 트리 · 최신 main · 범위 확인) → 브랜치 생성 → 계획 작성 (목적 · 설계 · 완료 조건 · 열린 질문) → 사람이 계획 검토 (수정이 필요하면 계획을 고쳐 다시 검토) → 승인 후 구현 시작 (승인 전에는 구현 코드를 쓰지 않음)</desc>
<defs><marker id="agent-plan-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">계획 승인 후 구현</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">요청과 현재 상태 확인</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">작업 트리 · 최신 main · 범위 확인</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-plan-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">브랜치 생성 → 계획 작성</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">목적 · 설계 · 완료 조건 · 열린 질문</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-plan-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">사람이 계획 검토</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">수정이 필요하면 계획을 고쳐 다시 검토</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-plan-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">승인 후 구현 시작</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">승인 전에는 구현 코드를 쓰지 않음</text>
</svg>

새 작업은 늘 “새로운 작업 …”이라는 말로 시작했습니다. 이 문장을 받으면 에이전트가 따를 순서를 정해뒀습니다.

먼저 작업 트리가 깨끗한지 확인하고 최신 main을 받습니다. 요청이 프로젝트의 현재 단계에 맞는지, 명시적으로 하지 않기로 한 범위에 걸리지 않는지 확인합니다. 그다음 브랜치를 만들고 계획 문서를 씁니다.

계획에는 목적, 작업 범위와 하지 않을 것, 설계, 구현 순서, 완료 조건, 아직 결정하지 못한 질문을 담습니다. 여기까지 하면 멈춥니다. 사람이 계획을 승인하기 전에는 구현 코드를 쓰지 않게 했습니다.

이 멈춤이 생각보다 중요했습니다. 모호한 요청을 받은 에이전트는 빈칸을 스스로 채웁니다. 그 해석이 맞으면 편하지만, 틀리면 상당한 양의 코드가 나온 뒤에야 차이를 발견합니다. 테스트까지 통과해 있으면 구현을 고치는 것과 별개로, 애초에 무엇을 만들려고 했는지부터 다시 설명해야 합니다.

계획을 먼저 읽으면 그 차이가 문단 몇 개에 드러납니다. 범위가 넓으면 줄이고, 전제가 틀리면 고치고, 빠진 결정이 있으면 그 자리에서 정합니다. 코드 수백 줄이 생긴 뒤보다 훨씬 쉽게 방향을 바꿀 수 있었습니다.

모든 수정을 이런 절차로 다뤄야 한다고 생각하지는 않습니다. 다만 이 프로젝트에서 기능 단위 작업을 맡길 때는, 계획 한 장을 먼저 검토하는 편이 전체 시간을 줄여줬습니다.

## 작업의 흔적을 한 묶음으로 남긴다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-trace-title agent-trace-desc">
<title id="agent-trace-title">작업 하나의 기록과 인수인계</title>
<desc id="agent-trace-desc">작업 하나 (하나의 목적과 완료 조건) → 브랜치 · 계획 문서 · PR (같은 작업에 대응하는 한 묶음) → 완료 폴더에 기록 보관 (변경 · 결정 · 검증 · 계획과 차이 · 후속) → 다음 세션이 읽고 이어서 작업 (대화 밖에서도 맥락을 찾을 수 있게)</desc>
<defs><marker id="agent-trace-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">작업 하나의 기록과 인수인계</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">작업 하나</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">하나의 목적과 완료 조건</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-trace-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">브랜치 · 계획 문서 · PR</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">같은 작업에 대응하는 한 묶음</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-trace-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">완료 폴더에 기록 보관</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">변경 · 결정 · 검증 · 계획과 차이 · 후속</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-trace-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">다음 세션이 읽고 이어서 작업</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">대화 밖에서도 맥락을 찾을 수 있게</text>
</svg>

브랜치와 계획 문서, PR을 작업 하나에 대응시킨 이유는 나중에 다시 읽기 위해서였습니다.

구현이 끝나면 계획 문서를 완료 폴더로 옮기고 짧은 완료 기록을 붙였습니다. 무엇이 바뀌었는지, 어떤 결정을 했는지, 어떤 검증을 거쳤는지, 계획과 달라진 점과 후속 작업은 무엇인지 남겼습니다.

이렇게 해두니 몇 주 뒤 “왜 이렇게 만들었지?”라는 질문이 생겼을 때 찾아볼 곳이 분명했습니다. PR에는 실제 변경이 있고, 문서에는 그 변경의 목적과 판단이 있습니다. 작업 하나를 이해하려고 여러 대화와 PR을 헤집는 일이 줄었습니다.

다음 세션의 에이전트에게도 도움이 됐습니다. 이전 대화를 전부 알고 있다고 기대하는 대신, 이어서 일하는 데 필요한 맥락을 저장소에서 읽게 했습니다. 사람이 인수인계 문서를 읽듯이 에이전트도 계획과 완료 기록을 읽고 다음 작업을 시작했습니다.

## 대화에서 정한 것은 문서에도 남긴다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-decision-title agent-decision-desc">
<title id="agent-decision-title">설계 결정을 확정하는 흐름</title>
<desc id="agent-decision-desc">설계 질문 발생 (구현 전에 결정이 필요한 지점 확인) → 사람과 논의해 결정 (대화 속 합의만으로 끝내지 않음) → 공통 결정 로그에 한 줄 기록 (로그에 남겨야 확정) → 구현과 다음 작업의 기준 (다음 세션도 같은 결정을 참조)</desc>
<defs><marker id="agent-decision-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">설계 결정을 확정하는 흐름</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">설계 질문 발생</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">구현 전에 결정이 필요한 지점 확인</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-decision-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">사람과 논의해 결정</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">대화 속 합의만으로 끝내지 않음</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-decision-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">공통 결정 로그에 한 줄 기록</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">로그에 남겨야 확정</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-decision-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">구현과 다음 작업의 기준</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">다음 세션도 같은 결정을 참조</text>
</svg>

작업 문서와 별개로, 제품의 설계 결정은 한곳에 모았습니다. 구현 전에 결정이 필요한 문제가 나오면 에이전트가 먼저 묻게 하고, 답이 정해지면 제품 문서의 결정 로그에 한 줄로 남겼습니다.

규칙은 “결정 로그에 없는 것은 확정이 아니다”였습니다.

대화에서 “그렇게 하죠”라고 말하는 것만으로는 부족했습니다. 그 대화를 보지 못한 다음 세션은 같은 질문을 다시 하거나 다른 전제로 구현할 수 있습니다. 결정이 코드에 반영돼 있어도, 그것이 의도한 정책인지 우연히 그렇게 구현된 것인지 알아내기는 어렵습니다.

그래서 작업 문서에는 해당 작업의 경위를 남기고, 여러 작업이 따라야 할 결정은 공통 로그에 남겼습니다. 길게 쓰기보다 무엇으로 정했는지 분명하게 적는 쪽을 택했습니다. 같은 결정을 매번 새로 논의하지 않는 것만으로도 대화가 꽤 줄었습니다.

## 규칙은 읽게 하고, 가능한 것은 검사하게 한다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-rules-title agent-rules-desc">
<title id="agent-rules-title">문서의 규칙을 코드 검사로 연결</title>
<desc id="agent-rules-desc">프로젝트 규칙 문서 (현재 단계 · 모듈 경계 · 컨벤션 · 절차) → 세션 시작 시 읽고 적용 (의도와 판단 기준 공유) → 기계로 판정할 규칙은 테스트로 (모듈 경계 · 금지된 의존성) → 빌드와 CI에서 위반 검사 (실패하면 수정 후 다시 검증)</desc>
<defs><marker id="agent-rules-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">문서의 규칙을 코드 검사로 연결</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">프로젝트 규칙 문서</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">현재 단계 · 모듈 경계 · 컨벤션 · 절차</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-rules-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">세션 시작 시 읽고 적용</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">의도와 판단 기준 공유</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-rules-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">기계로 판정할 규칙은 테스트로</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">모듈 경계 · 금지된 의존성</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-rules-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">빌드와 CI에서 위반 검사</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">실패하면 수정 후 다시 검증</text>
</svg>

저장소에는 에이전트가 매 세션 읽을 프로젝트 규칙 문서를 뒀습니다. 예외 없이 지켜야 할 규칙, 현재 개발 단계와 다음 시작점, 모듈 경계와 의존 방향, 코드·UI·다국어 컨벤션을 적었습니다. “새로운 작업”, “완료처리” 같은 말을 받았을 때 따라야 할 절차도 여기에 넣었습니다.

문서를 계속 늘리는 것만으로는 한계가 있었습니다. 길어질수록 놓칠 수 있고, 규칙을 읽었다고 항상 정확하게 적용하는 것도 아니었습니다.

기계로 판단할 수 있는 규칙은 테스트로 옮겼습니다. 모듈 경계를 넘는 참조나 금지된 의존성은 아키텍처 테스트가 검사하도록 했습니다. 문서에는 의도를 설명하고, 빌드와 CI에서는 실제 코드가 그 경계를 지키는지 확인했습니다.

리뷰에서도 “이 의존성은 금지라고 했는데”를 반복하는 대신, 사람이 판단해야 하는 설계와 동작에 더 집중할 수 있었습니다.

## 병렬로 맡겼더니 같은 결정을 세 번 했다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-parallel-title agent-parallel-desc">
<title id="agent-parallel-title">공통 결정을 맞춘 뒤 병렬 작업</title>
<desc id="agent-parallel-desc">화면 방향과 공통 기준 확정 (같은 제품 결정을 세션마다 바꾸지 않기) → 파일 영역과 의존 관계 나누기 (독립 작업은 병렬 · 의존 작업은 순서 지정) → 세션 A ↔ 세션 B (서로 다른 파일 영역에서 병렬 구현) → 미리 정한 순서로 머지 (계산 변경 → 그 기준을 쓰는 화면 변경)</desc>
<defs><marker id="agent-parallel-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">공통 결정을 맞춘 뒤 병렬 작업</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">화면 방향과 공통 기준 확정</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">같은 제품 결정을 세션마다 바꾸지 않기</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-parallel-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">파일 영역과 의존 관계 나누기</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">독립 작업은 병렬 · 의존 작업은 순서 지정</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-parallel-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">세션 A ↔ 세션 B</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">서로 다른 파일 영역에서 병렬 구현</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-parallel-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">미리 정한 순서로 머지</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">계산 변경 → 그 기준을 쓰는 화면 변경</text>
</svg>

여러 에이전트 세션을 동시에 돌리면 구현 속도는 확실히 빨라졌습니다. 하지만 각 세션의 작업이 잘 끝났다고 해서 합친 결과까지 자연스럽게 이어지지는 않았습니다.

한 기능의 화면 표시를 여러 세션에서 차례로 고친 적이 있습니다. 한 세션은 넓은 구간을 숨기는 쪽으로 바꿨고, 다른 세션은 흐리게 보여주는 쪽으로 바꿨습니다. 뒤이은 세션은 다시 앞선 변경을 되돌렸습니다. 각각의 설명은 합리적이었습니다. 그런데 PR을 이어서 놓고 보니 같은 자리를 돌고 있었습니다.

코드 충돌만의 문제가 아니었습니다. 같은 제품 결정을 각 세션이 따로 내리고 있었습니다. 파일이 깔끔하게 머지돼도 방향은 충돌할 수 있었습니다.

그 뒤로 화면 방향은 한 세션에서 모아서 정했습니다. 계산 방식 변경과 그 결과를 화면에서 어떻게 판정할지처럼 기준을 공유하는 작업은 머지 순서를 미리 정했습니다. 병렬로 맡길 때도 서로 다른 파일 영역을 나누되, 공통으로 전제하는 결정이 있는지 함께 봤습니다.

동시에 할 수 있는 일을 찾는 것만큼, 먼저 끝나야 다음 일을 시작할 수 있는 부분을 가려내는 게 중요했습니다.

## CI가 실패한 PR을 머지한 적도 있다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-merge-title agent-merge-desc">
<title id="agent-merge-title">머지 전후의 확인 순서</title>
<desc id="agent-merge-desc">PR의 충돌 여부 확인 (충돌이 있으면 해결한 뒤 검사 진행) → 모든 필수 검사 통과 확인 (실패·대기 중이면 머지하지 않음) → 머지 실행 (검사 확인과 머지 실행은 별도 단계) → 실제 머지 완료 확인 (확인한 뒤 작업 브랜치 삭제)</desc>
<defs><marker id="agent-merge-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">머지 전후의 확인 순서</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">PR의 충돌 여부 확인</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">충돌이 있으면 해결한 뒤 검사 진행</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-merge-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">모든 필수 검사 통과 확인</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">실패·대기 중이면 머지하지 않음</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-merge-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">머지 실행</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">검사 확인과 머지 실행은 별도 단계</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-merge-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">실제 머지 완료 확인</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">확인한 뒤 작업 브랜치 삭제</text>
</svg>

“CI가 녹색이 되기 전에는 머지하지 않는다”는 당연한 규칙도 한 번 어겼습니다.

검사 결과의 끝부분만 잘라서 출력하는 명령 뒤에 머지 명령을 이어 붙인 것이 문제였습니다. 실패 정보는 잘린 출력 밖에 있었고, 뒤의 머지 명령은 그대로 실행됐습니다. 결과를 확인하려고 넣은 명령이었지만, 그 확인이 머지 여부를 막는 조건으로 작동하지 않았습니다.

이후에는 검사 결과를 보는 단계와 머지를 실행하는 단계를 분리했습니다. 모든 필수 검사가 통과했는지 확인한 다음 머지하고, 실제로 머지가 끝난 것을 확인한 다음 브랜치를 지우도록 했습니다.

기다리는 순서도 손봤습니다. 충돌 때문에 CI가 시작되지 않는 경우에는 검사가 끝나기만 기다려도 진행되지 않습니다. 먼저 PR의 머지 가능 상태를 보고, 충돌을 해결한 뒤 검사를 기다리게 했습니다.

이 사고도 프로젝트 규칙 문서에 들어갔습니다. 다음 세션이 같은 실수를 피하려면, 그 세션이 읽을 수 있는 곳에 남겨야 했습니다.

## 절차를 추가한 만큼 덜어낸 것도 있다

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 540" style="display: block; max-width: 480px; width: 100%; height: auto; margin: 24px auto; font-family: var(--vp-font-family-base, sans-serif);" role="img" aria-labelledby="agent-finish-title agent-finish-desc">
<title id="agent-finish-title">중복을 줄인 완료 처리</title>
<desc id="agent-finish-desc">마지막 코드 변경 후 검증 (추가 변경이나 문제가 없다면 결과 재사용) → 짧은 완료 기록 (변경 · 결정 · 검증 결과를 항목당 한두 줄) → CI 통과 확인 → main 머지 (필수 확인은 유지) → 자동 배포 (위험한 변경은 배포 확인까지 수행)</desc>
<defs><marker id="agent-finish-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L7 4 L0 8" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5"/></marker></defs>
<rect width="480" height="540" rx="16" fill="var(--vp-c-bg-alt, #f8f6ef)"/>
<text x="240" y="39" text-anchor="middle" fill="var(--vp-c-text-2, #665b45)" font-size="16" font-family="sans-serif">중복을 줄인 완료 처리</text>
<rect x="20" y="64" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="96" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">마지막 코드 변경 후 검증</text>
<text x="240" y="122" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">추가 변경이나 문제가 없다면 결과 재사용</text>
<path d="M240 144 V164" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-finish-arrow)"/>
<rect x="20" y="174" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="206" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">짧은 완료 기록</text>
<text x="240" y="232" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">변경 · 결정 · 검증 결과를 항목당 한두 줄</text>
<path d="M240 254 V274" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-finish-arrow)"/>
<rect x="20" y="284" width="440" height="80" rx="10" fill="var(--vp-c-brand-soft, #fff0c6)" stroke="var(--vp-c-brand-1, #a8720f)"/>
<text x="240" y="316" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">CI 통과 확인 → main 머지</text>
<text x="240" y="342" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">필수 확인은 유지</text>
<path d="M240 364 V384" fill="none" stroke="var(--vp-c-brand-1, #a8720f)" stroke-width="1.5" marker-end="url(#agent-finish-arrow)"/>
<rect x="20" y="394" width="440" height="80" rx="10" fill="var(--vp-c-bg-soft, #ffffff)" stroke="var(--vp-c-divider, #d6d0c2)"/>
<text x="240" y="426" text-anchor="middle" fill="var(--vp-c-text-1, #282823)" font-size="19" font-weight="600" font-family="sans-serif">자동 배포</text>
<text x="240" y="452" text-anchor="middle" fill="var(--vp-c-text-2, #5d5a51)" font-size="15" font-family="sans-serif">위험한 변경은 배포 확인까지 수행</text>
</svg>

작업마다 계획을 쓰고, 기록을 남기고, 검사를 확인하다 보면 절차 자체가 일이 될 수 있습니다. 반복하면서 효과가 적은 부분은 줄였습니다.

마지막 코드 변경 이후 이미 통과한 검증은 완료 처리를 이유로 다시 돌리지 않았습니다. 추가 변경이나 새로운 문제가 없다면 기존 결과를 사용하고, CI가 맡은 검증은 CI에서 수행하게 했습니다.

완료 기록도 항목당 한두 줄로 제한했습니다. 바뀐 파일 목록은 PR에서 볼 수 있고, 실행한 명령을 전부 나열해도 판단의 이유가 더 잘 드러나지는 않았습니다. 나중에 읽을 사람이 알아야 할 변경과 결정, 검증 결과에 집중했습니다.

배포는 main에 머지하면 자동으로 진행되게 했습니다. 위험한 변경이 아니면 배포 완료를 기다리는 것까지 매 작업의 종료 조건으로 삼지는 않았습니다.

이렇게 남은 절차는 대체로 방향을 잘못 잡았을 때 되돌리는 비용이 큰 지점에 있었습니다. 구현 전에는 범위를 확인하고, 구현 중에는 필요한 결정을 기록하고, 머지 전에는 검증 결과를 확인했습니다. 그 사이의 구현은 에이전트가 맡아 진행했습니다.

몇 주 동안 가장 많이 달라진 것은 프롬프트의 길이나 표현보다 이 작업 방식이었습니다. 에이전트가 어디까지 스스로 진행해도 되는지, 어디에서 사람의 판단을 받아야 하는지가 분명해지니 맡길 수 있는 일도 늘었습니다. 지금도 새 작업을 시작할 때는 코드보다 계획 문서를 먼저 봅니다.
