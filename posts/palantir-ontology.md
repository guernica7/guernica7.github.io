---
title: 팔란티어의 온톨로지 — 학술 개념이 아닌 "운영 인프라"로서의 온톨로지
date: 2026-07-30
description: 팔란티어 Foundry 온톨로지의 메타데이터 모델, 인덱싱 인프라, 보안 모델을 뜯어보고 엔터테크에서 훔칠 만한 아키텍처 패턴을 정리합니다.
---

# 팔란티어의 온톨로지 — 학술 개념이 아닌 "운영 인프라"로서의 온톨로지

팔란티어(Palantir)가 말하는 Ontology는 OWL/RDF 계열의 시맨틱 웹 온톨로지와는 완전히 다른 물건이다. 데이터 타입 시스템이 RDF, OWL, XSD 개념에서 영감을 받았다는 흔적만 남아 있을 뿐, 실제로는 **"조직의 디지털 트윈을 데이터베이스 + API + 권한 시스템 + 쓰기 레이어까지 묶어서 제공하는 운영 계층(operational layer)"**에 가깝다.

Ontology는 Foundry 플랫폼에 통합된 디지털 자산(데이터셋, 가상 테이블, 모델) 위에 놓여, 이들을 실제 세계의 대응물 — 공장·장비·제품 같은 물리 자산부터 고객 주문·금융 거래 같은 개념까지 — 과 연결하는 레이어다. 팔란티어는 이를 두 가지 축으로 설명한다.

- **Semantic 요소**: objects, properties, links — "조직에 무엇이 존재하고 어떻게 연결되는가"
- **Kinetic 요소**: actions, functions, dynamic security — "조직의 통제와 거버넌스를 지키면서 어떻게 변화를 일으키는가"

통상적인 데이터 카탈로그나 시맨틱 레이어(dbt semantic layer, LookML 등)는 **읽기 전용**이다. 팔란티어 온톨로지의 결정적 차이는 **쓰기(write-back)가 일급 시민**이라는 점이고, 이것이 아래에서 다룰 Action Type의 존재 이유다.

---

## 1. 메타데이터 모델 — 온톨로지를 구성하는 타입들

### Object Type / Property

Object type의 정의는 데이터셋과 유사하고, object는 데이터셋의 row 하나에 해당한다. Object set은 필터링된 row 집합이다. 예를 들어 `Employee` object type은 Employee 데이터셋에, `Melissa Chang`이라는 object는 row 하나에 대응한다. 중요한 것은 추상적 데이터 모델이 아니라 **각 온톨로지 개념이 조직의 실제 데이터에 매핑된다**는 점이다. Ontology Manager에서 object type에 backing datasource를 연결하는 순간 객체가 생성되고 애플리케이션에 표시된다.

프로퍼티에는 재사용 개념도 있다. **Shared Property**는 여러 object type에서 공통으로 사용하는 프로퍼티로, object type 간 일관된 데이터 모델링과 프로퍼티 메타데이터의 중앙 관리를 가능하게 한다.

### Link Type

Link type은 두 object type 간 관계의 스키마 정의이고, link는 그 관계의 단일 인스턴스다. 구현 관점에서는 두 데이터셋을 조인해 관계를 표현하는 것과 같으며, 조인된 데이터셋의 한 row가 하나의 link다. Link type은 양방향(bidirectional)이라 항상 두 면을 가지고, 각 면을 독립적으로 순회할 수 있으며 각각 display name과 API name을 가진다. 실제 구성은 1:1/1:N은 FK 기반, N:M은 join table 기반이다. RDB의 FK와 그래프 DB의 edge를 섞은 느낌이다.

### Action Type — 핵심 차별점

Action type은 사용자가 한 번에 수행할 수 있는 객체·프로퍼티·링크 변경 집합의 스키마 정의이며, 실행 시 발생하는 side effect까지 포함한다. 온톨로지에 대한 **"트랜잭션 + 비즈니스 룰 + 권한 검증 + 사이드이펙트"를 선언적으로 정의**하는 것이다.

공식 문서의 예시가 직관적이다. "Assign Employee"라는 action type을 만들면:

- 표준화된 폼으로 새 role을 입력받는 **파라미터 정의**
- 새 Manager 객체와의 링크를 자동 생성하는 **룰**
- 이전/신규 매니저에게 알림을 보내는 **notification side effect**
- HR 부서 직원만 수행할 수 있다는 **검증**

까지 하나의 선언에 담긴다. 내부적으로는 룰 컴파일 개념이 있어서, 여러 룰이 정의되면 actions backend가 이를 컴파일해 객체당 단일 edit을 생성하고, 룰 순서가 최종 edit에 영향을 준다.

### Function

Function은 입력 파라미터를 받아 출력을 반환하는 코드 기반 로직이다. TypeScript/Python으로 작성하며, Function-backed Action(복잡한 쓰기 로직), 파생 프로퍼티 계산, LLM 백엔드 로직(AIP Logic) 등에 쓰인다.

### 메타데이터 거버넌스 장치

온톨로지 자체에 라이프사이클 메타데이터가 내장되어 있다는 점이 흥미롭다.

- **Status**: 모든 object type, property, link type, action, interface는 `experimental → active → deprecated` 같은 개발 상태를 가진다. active는 사용자 대면 앱에서 활발히 사용 중이라 주요 breaking change를 하지 않는다는 뜻이다. object type 전용의 **promoted** 상태는 중앙 팀이 관리하고 높은 기준으로 검증된 "core" 리소스임을 표시한다. API 버저닝의 semver 개념을 데이터 모델에 적용한 셈이다.
- **Type Class**: 프로퍼티/링크/액션에 붙이는 태그 메타데이터로, 해당 값과 상호작용할 때 애플리케이션이 어떻게 렌더링/동작해야 하는지를 기술한다.
- **Roles**: 온톨로지의 중심 권한 모델로, 온톨로지 레벨 또는 개별 리소스 레벨에서 부여한다.

---

## 2. 데이터 파이프라인 — Raw 데이터에서 온톨로지까지

전체 흐름은 대략 이렇다.

```
외부 시스템 (SAP, DB, S3, Kafka, API...)
   ↓ Data Connection (sync)
Foundry Dataset (파일 컬렉션 + 트랜잭션 로그)
   ↓ Pipeline Builder / Code Repositories (transforms)
정제된 Dataset
   ↓ Ontology Manager (backing datasource 매핑)
   ↓ Funnel (인덱싱 파이프라인)
Object Storage v2 (온톨로지 객체 스토어)
   ↓ OSDK / API / Workshop / AIP
애플리케이션 & 에이전트
```

**Dataset 계층.** 데이터는 Foundry에 도착한 시점부터 온톨로지 객체 모델에 매핑될 때까지 Foundry 데이터셋으로 표현된다. 근본적으로 Foundry 데이터셋은 backing 파일 시스템에 저장된 파일 컬렉션의 wrapper이며, Git처럼 브랜치와 트랜잭션(APPEND/SNAPSHOT) 개념이 있어 데이터에 버전 관리를 적용한다.

**변환 계층.** Pipeline Builder가 주력 데이터 통합 도구로, Spark와 Flink를 실행 엔진으로 활용하면서 코드를 쓰는 사용자와 안 쓰는 사용자가 같은 파이프라인에서 협업할 수 있게 한다. 아키텍처적으로 눈여겨볼 점은 데이터 변환을 기술하는 **일반 모델(중간 표현)**을 두어 변환 작성 도구와 실행을 분리했다는 것이다. 덕분에 데이터셋·온톨로지 객체·스트림·시계열·외부 export 등 모든 종류의 출력을 같은 파이프라인 정의에서 지원한다. 코드가 필요하면 Code Repositories에서 Python/SQL/Java transforms를 직접 작성한다.

**운영 품질.** 파이프라인에는 소유권 개념(정기적·안정적으로 데이터가 흐르도록 감독하는 사람/그룹)이 있고, 스케줄·health check·data expectations 같은 장치로 프로덕션 등급을 유지한다.

---

## 3. 인프라 — Object Storage v2와 Funnel

### OSv1(Phonograph) → OSv2 전환

초기 아키텍처인 Object Storage v1(코드명 Phonograph)은 API surface가 넓고 저수준 DB 기능을 직접 노출하는 구조였으며(내부적으로 검색엔진에 강하게 결합), 2026년 6월 30일부로 deprecated 되었다. OSv2는 스케일 요구에 맞춰 재설계되었는데, OSv1에서 하나로 뭉쳐 있던 관심사를 분리하고 — 특히 **인덱싱과 쿼리 서브시스템을 분리**해 — 수평 확장이 쉬워지도록 했다.

핵심 설계는 이것이다: OSv2는 **Object Data Funnel 서비스를 통해 객체를 용도별 특화 object database들로 동기화**한다. "쓰기/인덱싱 경로(Funnel)"와 "읽기 경로(특화 DB들)"를 분리한 CQRS 스타일 아키텍처다.

### Funnel — 인덱싱 오케스트레이터

Funnel은 온톨로지에서 객체 인스턴스를 생성·수정하고 데이터/메타데이터를 최신으로 유지하는 파이프라인을 오케스트레이션하며, batch와 streaming 두 종류가 있다.

**Batch 파이프라인**의 내부 동작:

1. **Changelog job** — datasource에 새 데이터/트랜잭션이 들어오면 Funnel이 데이터 diff를 자동 계산해 중간 changelog dataset을 생성한다(APPEND 트랜잭션으로 증분 계산 시맨틱 제공).
2. **Merge changes job** — 모든 changelog dataset과 Action에서 발생한 최근 사용자 edit을 primary key로 조인해 병합한다.
3. **Indexing job** — object database별로 병합된 row들을 각 DB 호환 포맷으로 변환한다. canonical OSv2 DB의 경우 index 파일로 변환해 별도 index dataset에 저장한다.
4. **준비 단계** — index 파일들을 검색 노드의 디스크로 다운로드해 쿼리 가능한 상태로 만든다.

모든 파이프라인이 기본적으로 증분(incremental) 인덱싱되고, changelog 계산은 Funnel이 백그라운드에서 자동 수행한다.

**Streaming 파이프라인**은 Foundry stream을 입력으로 사용해 초~분 단위 저지연 인덱싱을 지원한다. 모든 스트림을 changelog 스트림처럼 취급하는 "most recent update wins" 전략을 쓰기 때문에, 이벤트가 순서 없이 도착하면 온톨로지에 잘못된 데이터가 들어간다. 스트리밍 object type에는 사용자 edit이 지원되지 않는 등의 제약도 있다.

### 스케일

OSv2는 단일 object type 기준 수백억(tens of billions) 객체 규모의 인덱싱 처리량, 멀티 datasource object type을 통한 컬럼/프로퍼티 레벨 권한, 단일 Action으로 최대 1만 객체 edit을 지원한다.

정리하면: **소스 데이터는 lake(파일 + 트랜잭션 로그)에 있고, Funnel이 diff를 계산해 검색/그래프 순회에 최적화된 인덱스로 변환하며, 사용자 edit(Action)은 별도 스토어에 쌓였다가 merge 단계에서 합쳐진다.** 사용자 edit과 파이프라인 데이터가 분리 관리되므로 상류 데이터가 재빌드되어도 사용자가 앱에서 입력한 값이 사라지지 않는다.

---

## 4. 보안 모델 — 온톨로지에 내장된 권한

정부/방산에서 출발한 회사답게, 보안이 데이터 모델에 융합되어 있다.

- 권한 구조는 두 레벨로 나뉜다: 스키마를 정의하는 **ontology resource**(object type, link type, action type)와 실제 데이터인 **objects/links**.
- **Row-level**: Restricted view는 backing dataset 위에 만들어져 사용자가 볼 수 있는 row만 제한하며, 이를 object type의 backing datasource로 쓰면 사용자가 볼 수 있는 객체가 제어된다. Granular policy는 사용자 속성·컬럼·값을 비교하는 룰과 논리 연산자의 집합이다.
- **최신 방향**: Object security policy는 backing datasource 권한과 **독립적으로** object type에 보안 정책을 설정해 row-level 보안을 달성하고, property security policy로 특정 프로퍼티의 가시성을 별도 통제해 column-level 보안을 달성한다. 둘을 합치면 **cell-level 보안**이 된다. 예컨대 VIP marking이 있어야 특정 승객 객체를 보고, PII marking이 있어야 이름·주소·전화번호 프로퍼티에 접근하는 식이다.
- **쓰기 권한은 Action을 통해서만**: "Only allow edits via actions" 옵션을 켜면 해당 object type의 edit 권한이 action type을 통해서만 제어된다. DB에 직접 UPDATE하는 경로 자체를 막고 모든 변경을 검증된 Action 경로로 강제할 수 있다.

---

## 5. 소비 레이어 — OSDK와 AI 에이전트

온톨로지를 정의하면 소비 인터페이스가 자동으로 생성된다. 온톨로지에 데이터를 모델링하는 것만으로 API gateway와 **Ontology SDK(OSDK)**가 생성되어 엔터프라이즈 전반의 "operational bus" 역할을 한다. OSDK는 Python, Java, TypeScript를 지원하며, 타입이 온톨로지에서 코드젠되므로 백엔드 스키마와 프론트 타입이 항상 동기화된다. 비유하자면 온톨로지 정의가 곧 ORM 모델 + API Resource + TypeScript 타입 + 권한 미들웨어를 한 번에 생성해주는 것이다.

그리고 2023년 이후 팔란티어의 진짜 승부수가 여기 있다. **온톨로지가 LLM 에이전트의 안전한 실행 환경**이 된다는 논리다. RAG는 LLM이 더 관련성 높은 정보를 보게 해줄 뿐, "LLM이 봐서는 안 되는 것"과 "LLM이 할 수 있는 것"의 문제를 해결하지 못한다. 팔란티어의 접근은 retriever를 끼워넣는 대신 모든 명사·관계·규칙·액션·권한을 모델링한 거버넌스 레이어를 먼저 구축하고, 에이전트가 raw 데이터가 아닌 그 레이어 위에서 동작하게 하는 것이다.

- LLM에게 주는 tool이 곧 **Action Type**이므로, 에이전트가 할 수 있는 일이 권한 시스템 안에서 구조적으로 제한된다.
- AIP Chatbot Studio로 만든 챗봇은 LLM + 온톨로지 + 문서 + 커스텀 tool로 구동되며, OSDK와 플랫폼 API를 통해 외부에도 배포 가능하다.
- Palantir MCP는 외부 개발 도구나 AI 코딩 어시스턴트가 온톨로지를 검색하고, 안전하게 수정하고, 애플리케이션을 업데이트할 수 있게 한다.

---

## 6. 엔터테크 관점의 인사이트

팔란티어를 도입하자는 이야기가 아니다(가격이 엔터프라이즈급이다). 하지만 **아키텍처 패턴으로서 훔칠 만한 아이디어**가 분명히 있다. 팬덤 플랫폼, 아티스트 IP 비즈니스, 라이브 커머스처럼 데이터와 운영이 뒤섞이는 엔터테크 도메인에서 특히 그렇다.

### "의사결정 중심 모델링"이라는 관점

통상 우리는 소스 시스템 스키마(정규화된 RDB)를 그대로 API로 노출한다. 팔란티어는 반대로 **"운영자가 내리는 의사결정"을 기준으로 객체를 모델링**한다. 엔터테크로 치환하면 `Artist` — `Content` — `Fan` — `LiveEvent` — `Purchase` 같은 객체와 링크가 온톨로지이고, "라이브 방송 중 특정 팬에게 리워드 지급", "아티스트 콘텐츠 공개 스케줄 승인" 같은 것이 Action Type이다. 리워드 지급이라는 하나의 행위에 파라미터 검증, 링크 생성, 알림 발송, 권한 체크가 선언적으로 묶이는 그림을 상상해보면, 이미 우리가 서비스 레이어에서 절차적으로 짜고 있는 코드를 메타데이터로 끌어올린 것임을 알 수 있다.

### CQRS + 증분 인덱싱 패턴

Funnel의 구조 — 소스 오브 트루스(트랜잭션 로그가 있는 데이터셋)와 읽기 최적화 인덱스(검색엔진)를 분리하고, diff 기반 증분으로 동기화하며, 사용자 edit을 별도 스토어에 두고 merge하는 방식 — 는 아티스트/팬 분석 대시보드나 콘텐츠 탐색 기능을 만들 때 그대로 참고할 수 있다. RDB(원본) + OpenSearch/Elasticsearch(탐색용) 조합을 설계한다면, "전체 재색인" 대신 changelog 기반 증분 색인과 "사용자 입력 데이터의 별도 보존"이라는 두 원칙만 가져와도 운영 난이도가 크게 달라진다.

### 팬 데이터에 대한 cell-level 보안

엔터테크는 팬의 개인정보(PII), 결제 정보, 아티스트 계약 정보처럼 민감도가 제각각인 데이터가 한 시스템에 공존한다. 팔란티어의 marking 기반 cell-level 보안 — 객체 가시성과 프로퍼티 가시성을 독립적으로 통제하는 모델 — 은 "CS팀은 팬 객체를 보되 결제 프로퍼티는 못 본다" 같은 요구를 데이터 모델 차원에서 푸는 방법을 보여준다. 애플리케이션 코드마다 if문으로 가리는 방식과의 차이는 규모가 커질수록 벌어진다.

### 메타데이터 라이프사이클

experimental → active → deprecated status와 promoted 개념은, 팀이 커지면서 API/스키마 변경 관리가 고통스러워질 때 도입할 가치가 있는 저비용 거버넌스 장치다. "이 object type은 프로덕션 앱이 의존하고 있으니 breaking change 금지"를 문화가 아니라 메타데이터로 표현하는 것이다.

### LLM tool = 검증된 Action이라는 등식

팬 대상 AI 챗봇, 아티스트 운영 자동화 에이전트를 만든다면 가장 중요한 교훈이 이것이다. **에이전트에게 raw DB 접근을 주지 말고, 파라미터 검증·권한 체크·사이드이펙트가 정의된 Action만 tool로 노출하라.** 에이전트의 행동 반경이 프롬프트가 아니라 권한 시스템으로 제한되면, 프롬프트 인젝션이 발생해도 피해 범위가 구조적으로 한정된다. 온톨로지 없이도 이 원칙은 오늘 당장 적용할 수 있다.

---

## 참고 자료

- [Palantir Foundry — Ontology Overview](https://www.palantir.com/docs/foundry/ontology/overview)
- [Ontology Core Concepts](https://www.palantir.com/docs/foundry/ontology/core-concepts)
- [Object Backend (Object Storage v2) Architecture](https://www.palantir.com/docs/foundry/object-backend/overview)
- [Funnel Batch Pipelines](https://www.palantir.com/docs/foundry/object-indexing/funnel-batch-pipelines)
- [Funnel Streaming Pipelines](https://www.palantir.com/docs/foundry/object-indexing/funnel-streaming-pipelines)
- [Pipeline Builder Overview](https://www.palantir.com/docs/foundry/pipeline-builder/overview)
- [Object Permissioning Overview](https://www.palantir.com/docs/foundry/object-permissioning/overview)
- [Platform Overview (OSDK, AIP)](https://www.palantir.com/docs/foundry/platform-overview/overview)
- [Palantir MCP](https://www.palantir.com/docs/foundry/palantir-mcp/overview)
