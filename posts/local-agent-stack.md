---
title: Mac mini 한 대로 꾸린 로컬 에이전트 스택
date: 2026-07-10
description: LM Studio, AnythingLLM, Google ADK 세 층으로 나눈 구성과 전체 세팅, 삽질 기록.
---

# Mac mini 한 대로 꾸린 로컬 에이전트 스택

Mac mini M2 Pro 32GB에서 로컬 에이전트 환경을 세 층으로 나눠 구축했습니다.
모델 엔진은 LM Studio, 일상용 UI는 AnythingLLM, 커스텀 에이전트 개발은
Google ADK가 맡습니다. 다른 Mac에서도 이 글만 보고 처음부터 끝까지 재현할
수 있도록 설치 절차와 최종 코드를 전부 남깁니다.

```
[LM Studio]  모델 엔진 · localhost:1234 · 백그라운드 상주
     ├── [AnythingLLM]  일상용: 지식베이스(RAG) + @agent
     └── [Google ADK]   개발용: 커스텀 에이전트 코드 (~/workspace/adk-lab)
```

역할 분담은 이렇게 정했습니다.

- **클로드(Claude)**: 실제 업무, 복잡한 작업. 품질 우선.
- **AnythingLLM**: 외부에 못 올리는 민감 문서 Q&A. 무제한 로컬 사용.
- **ADK**: 절차가 고정된 반복 작업을 "기능"으로 제작 (배치, 파이프라인).

하드웨어 기준도 정리해 둡니다. Apple Silicon 통합 메모리 32GB에서 모델에
쓸 수 있는 건 약 20GB입니다. 12~14B 4bit(7~9GB)가 쾌적한 기본값이고,
30B급 MoE 4bit(~18GB)는 다른 앱을 닫는 조건으로 가능, 70B 이상은 불가.

## LM Studio: 모델 엔진

설치는 lmstudio.ai에서 dmg를 받아 Applications에 넣으면 끝인데, 첫 실행의
사용자 유형 선택에서 **Developer**를 골라야 서버 기능이 바로 보입니다.

모델은 **Gemma 4 12B QAT**(GGUF Q4, 약 7.15GB)를 기본으로 받았습니다.
Vision·Tool Use·Reasoning을 지원하고 "Full GPU Offload Possible" 초록
표시가 뜨는 걸 확인하면 됩니다. MLX 버전이 있으면 그쪽이 Mac에서 더
빠릅니다. 업그레이드용으로 **Qwen3.6 35B A3B** 4bit(~18GB)도 후보로
받아뒀습니다. 에이전트 작업에 더 강합니다.

서버는 두 군데를 켭니다.

1. Developer 탭 → 좌상단 Status 토글 → **Running** (`http://localhost:1234`)
2. 설정(`⌘ + ,`) → Developer 섹션 → **Enable Local LLM Service** — 앱을
   닫아도 서버가 메뉴 막대에서 유지되고 로그인 시 자동 시작됩니다.
   같은 곳의 **Just-in-Time Model Loading**도 켜두면 요청이 올 때 모델을
   알아서 로드합니다.

검증은 브라우저에서 `http://localhost:1234/v1/models`. 여기 나오는
`"id"` 값(예: `google/gemma-4-12b-qat`)이 이후 모든 설정의 기준값입니다.

## AnythingLLM: 지식베이스 + 에이전트 UI

anythingllm.com에서 Desktop(Apple Silicon)판을 설치합니다. 첫 온보딩에서
내장 모델 다운로드를 권하면 건너뛰고 수동 설정으로 LLM Preference를
**LM Studio**로 지정합니다.

- Base URL: `http://localhost:1234/v1`
- Model: `google/gemma-4-12b-qat`
- Token context window: `8192`

임베딩과 벡터 DB는 기본값(AnythingLLM Embedder / LanceDB)이 전부 내장이라
따로 만질 게 없습니다.

RAG는 워크스페이스 단위입니다. 주제별로 워크스페이스를 만들면 서로
섞이지 않고, 문서(PDF/docx/txt/md)를 끌어다 놓고 Move to Workspace →
**Save and Embed** 하면 끝. 질문했을 때 답변 아래 **Citations**가 뜨면
문서 기반 답변입니다.

운용하면서 잡은 요령들:

- 지식베이스 검증에는 Chat Settings에서 Chat mode를 **Query**로. 문서에
  있는 것만 답해서 환각 여부를 바로 가릴 수 있습니다.
- 한국어 개선은 시스템 프롬프트에 "항상 한국어로 답변하세요" 한 줄.
- `@agent`를 붙이면 웹검색·파일저장·차트 같은 에이전트 모드가 되는데,
  이때는 Citations UI가 없습니다. `/exit`로 종료. 검증과 활용을 구분해야
  합니다. 에이전트 스킬은 설정 → Agent Skills에서 켭니다(Web Search는
  DuckDuckGo면 키가 필요 없습니다).

MCP 도구도 물릴 수 있습니다. 설정 파일은
`~/Library/Application Support/anythingllm-desktop/storage/plugins/anythingllm_mcp_servers.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/사용자명/Documents/agent-workspace"
      ]
    },
    "korean-law": {
      "command": "npx",
      "args": ["-y", "korean-law-mcp"],
      "env": { "LAW_OC": "국가법령정보API키" }
    }
  }
}
```

사전 조건은 `brew install node`, korean-law는 open.law.go.kr에서 키
발급(승인 필요). 적용은 설정 → Agent Skills → Refresh 후 초록불 확인.
다만 로컬 12B는 도구가 많으면 호출이 흔들려서, MCP 위주로 쓸 거면
30B급을 권합니다.

백업은 `~/Library/Application Support/anythingllm-desktop/storage/` 폴더
하나만 복사하면 지식베이스 전체를 이전할 수 있습니다.

## ADK: 커스텀 에이전트

### 준비와 프로젝트 구조

Python 3.10 이상이면 됩니다. Gemini API 키는 aistudio.google.com/apikey
에서 무료 발급(2026-07 기준 무료 티어 모델은 `gemini-3.5-flash`, 구버전
`gemini-2.5-flash`는 404가 납니다).

```bash
mkdir -p ~/workspace/adk-lab
cd ~/workspace/adk-lab
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install google-adk litellm requests
adk --version    # 이 글은 ADK 2.4.0에서 검증

# 새 터미널마다 venv를 다시 켜야 하므로 알리아스 등록
echo "alias adklab='cd ~/workspace/adk-lab && source .venv/bin/activate'" >> ~/.zshrc
```

에이전트 하나는 폴더 하나로, `__init__.py`(내용은 `from . import agent`
한 줄), `.env`(API 키), `agent.py` 세 파일입니다. 최종 구조:

```
adk-lab/
├── weather_agent/           # ① Gemini + 가짜 도구 (입문)
├── weather_agent_local/     # ② 로컬 모델 + 실제 날씨 API
└── report_team/             # ③ 멀티 에이전트 (100% 로컬)
```

```bash
cd ~/workspace/adk-lab
for d in weather_agent weather_agent_local report_team; do
  mkdir -p $d
  echo "from . import agent" > $d/__init__.py
done
cat > weather_agent/.env << 'EOF'
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=여기에_발급받은_키
EOF
cp weather_agent/.env weather_agent_local/.env
cp weather_agent/.env report_team/.env
```

### ① Gemini + 가짜 도구 — 입문용

도구는 특별한 데코레이터 없이 평범한 파이썬 함수입니다. 모델이
**docstring을 읽고 언제 쓸지 판단**하므로 설명을 제대로 쓰는 게 중요하고,
변수명은 반드시 `root_agent`여야 ADK가 찾습니다.

```python
from google.adk.agents import Agent

def get_weather(city: str) -> dict:
    """지정한 도시의 현재 날씨를 조회합니다.

    Args:
        city: 도시 이름 (예: 서울, 부산)
    """
    fake_db = {
        "서울": {"temp": "29도", "sky": "맑음"},
        "부산": {"temp": "27도", "sky": "흐림"},
    }
    if city in fake_db:
        return {"status": "success", "report": fake_db[city]}
    return {"status": "error", "message": f"{city}의 날씨 정보가 없습니다."}

def get_current_time(city: str) -> dict:
    """지정한 도시의 현재 시간을 반환합니다."""
    from datetime import datetime
    return {"status": "success", "time": datetime.now().strftime("%H시 %M분")}

root_agent = Agent(
    name="weather_agent",
    model="gemini-3.5-flash",
    description="날씨와 시간을 알려주는 도우미",
    instruction=(
        "당신은 친절한 날씨 도우미입니다. 항상 한국어로 답하세요. "
        "날씨 질문에는 get_weather, 시간 질문에는 get_current_time 도구를 사용하세요. "
        "도구가 error를 반환하면 정보가 없다고 정직하게 말하세요."
    ),
    tools=[get_weather, get_current_time],
)
```

### ② 로컬 모델 + 실제 날씨 API

같은 에이전트를 LM Studio의 Gemma로 돌리고, 가짜 데이터 대신
Open-Meteo(비상업용 무료, API 키·가입 불필요)를 붙인 버전입니다.
도시 이름 → 지오코딩 → 현재 날씨의 2단 호출입니다.

```python
import requests
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

def get_weather(city: str) -> dict:
    """지정한 도시의 현재 날씨를 조회합니다.

    Args:
        city: 도시 이름 (예: 서울, 부산, 뉴욕)
    """
    geo = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": city, "count": 1, "language": "ko"},
        timeout=10,
    ).json()
    if not geo.get("results"):
        return {"status": "error", "message": f"'{city}' 도시를 찾을 수 없습니다."}
    loc = geo["results"][0]

    data = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": loc["latitude"],
            "longitude": loc["longitude"],
            "current": "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
            "timezone": "auto",
        },
        timeout=10,
    ).json()
    cur = data["current"]
    codes = {0: "맑음", 1: "대체로 맑음", 2: "구름 조금", 3: "흐림", 45: "안개",
             51: "이슬비", 61: "비", 63: "비", 65: "폭우", 71: "눈",
             80: "소나기", 95: "뇌우"}
    return {
        "status": "success",
        "report": {
            "도시": loc["name"],
            "기온": f"{cur['temperature_2m']}°C",
            "습도": f"{cur['relative_humidity_2m']}%",
            "날씨": codes.get(cur["weather_code"], f"코드 {cur['weather_code']}"),
            "풍속": f"{cur['wind_speed_10m']} km/h",
        },
    }

def get_current_time(city: str) -> dict:
    """지정한 도시의 현재 시간을 반환합니다."""
    from datetime import datetime
    return {"status": "success", "time": datetime.now().strftime("%H시 %M분")}

root_agent = Agent(
    name="weather_agent_local",
    model=LiteLlm(
        model="openai/google/gemma-4-12b-qat",   # "openai/" + LM Studio 모델 ID
        api_base="http://localhost:1234/v1",
        api_key="lm-studio",                      # 아무 값이나 OK
    ),
    description="날씨와 시간을 알려주는 도우미 (로컬 모델)",
    instruction=(
        "당신은 친절한 날씨 도우미입니다. 항상 한국어로 답하세요. "
        "날씨 질문에는 get_weather, 시간 질문에는 get_current_time 도구를 사용하세요. "
        "도구가 error를 반환하면 정보가 없다고 정직하게 말하세요."
    ),
    tools=[get_weather, get_current_time],
)
```

모델명에 슬래시가 두 번 들어가는 게 정상입니다. LiteLLM에게 "OpenAI 호환
API"라고 알려주는 `openai/` 접두사 뒤에 LM Studio 모델 ID가 그대로
붙습니다.

### ③ 멀티 에이전트 팀 — 100% 로컬

조사자 → 작가 → 검토자가 순서대로 일하는 팀입니다. 로컬 모델 하나를
셋이 공유합니다.

```python
from google.adk import Agent, Workflow
from google.adk.models.lite_llm import LiteLlm

local_model = LiteLlm(
    model="openai/google/gemma-4-12b-qat",
    api_base="http://localhost:1234/v1",
    api_key="lm-studio",
)

researcher = Agent(
    name="researcher",
    model=local_model,
    instruction=(
        "사용자가 준 주제에 대해 알고 있는 핵심 사실 5가지를 "
        "번호 목록으로 정리하세요. 한국어로 작성하세요."
    ),
)

writer = Agent(
    name="writer",
    model=local_model,
    instruction=(
        "입력으로 받은 조사 내용을 바탕으로 "
        "3문단짜리 짧은 보고서를 한국어로 작성하세요."
    ),
)

reviewer = Agent(
    name="reviewer",
    model=local_model,
    instruction=(
        "입력으로 받은 보고서 초안을 검토하세요. 사실 오류나 어색한 문장을 "
        "지적하고, 수정된 최종본을 제시하세요. 한국어로 작성하세요."
    ),
)

root_agent = Workflow(
    name="report_team",
    edges=[("START", researcher, writer, reviewer)],
)
```

ADK 2.0부터는 `Workflow`가 현행 API고 `SequentialAgent`는 deprecated입니다.
`edges`의 튜플이 실행 순서를 정의하고 각 노드의 출력이 자동으로 다음 노드
입력이 되므로 `output_key` 같은 배선이 필요 없습니다. 에이전트뿐 아니라
일반 파이썬 함수도 노드로 끼울 수 있습니다.

### 실행과 검증

```bash
adklab       # venv 활성화 + 이동
adk web      # http://localhost:8000 — 부모 폴더(adk-lab)에서 실행해야 함
```

1. `weather_agent` — "서울 날씨 어때?" → Events/Trace에서 `get_weather`
   호출 확인. 이 Trace가 "모델이 지어낸 답"과 "도구를 진짜 부른 답"을
   구분해 주는 핵심입니다.
2. `weather_agent_local` — "뉴욕 날씨는?" → 실제 날씨 응답과 LM Studio
   로그의 요청 확인.
3. `report_team` — "MoE 모델이란 무엇인가" → START→researcher→writer→
   reviewer→END 그래프 실행 확인. 시간이 지나도 안 변하는 개념형 주제가
   좋고, 최신 뉴스류는 도구가 없어 헛발질합니다.

## 삽질 기록

재현 시 시행착오를 줄이기 위한 에러별 정리입니다.

| 에러 | 원인 | 해법 |
|---|---|---|
| `command not found: adk` | 새 터미널에서 venv 비활성 | `adklab` 알리아스 |
| `404 models/gemini-2.5-flash no longer available` | 구모델 제공 종료 | `gemini-3.5-flash` (2026-07 기준) |
| `503 UNAVAILABLE high demand` | Gemini 무료 티어 혼잡 | 재시도 또는 로컬 모델. 무료 티어는 25~40초 걸리기도 함 |
| `LLM Provider NOT provided` | `openai/` 접두사 누락 | `openai/google/gemma-4-12b-qat` — 슬래시 2번이 정상 |
| `SequentialAgent is deprecated` | ADK 2.0 API 변경 | `Workflow(edges=[("START", a, b, c)])` |
| `ValidationError: input_schema ... BaseModel` | `input_schema=str` 불허 | `input_schema` 삭제 (Pydantic 모델만 허용) |
| `JSONDecodeError` | `output_schema`가 JSON 강제 파싱, 로컬 모델은 일반 텍스트 응답 | 로컬 모델에선 `output_schema` 삭제 |
| "에이전트가 대답 안 함" / `No root_agent found` | 모듈 로딩 실패 (문법 오류 등) | `python -c "import 폴더명.agent"`로 진짜 에러 확인. 원인은 항상 터미널 로그 맨 아래 |
| AnythingLLM에서 인용 표시가 안 보임 | `@agent` 모드는 Citations UI 없음 | `/exit` 후 일반 모드 또는 Query 모드로 검증 |

표에 안 담긴 교훈들:

- 멀티 에이전트를 단일 로컬 모델로 돌리면 에이전트 전환마다 캐시 미스
  경고가 뜨고 느려집니다. 정상이고 오류가 아닙니다.
- 같은 모델이 reviewer를 맡으면 자기 오류를 잘 못 잡습니다. 검토자만
  더 크거나 다른 모델로 바꾸는 실험이 가치 있습니다.
- QAT 모델은 같은 4bit라도 품질이 우수합니다. MoE(A3B 등)는 덩치 대비
  속도가 빠릅니다.
- 클라우드용 예제(스키마, 구모델명)를 로컬에 그대로 옮기면 깨지는 경우가
  많습니다. 이 글의 코드는 전부 로컬 검증을 마친 버전입니다.

## 다음 단계

1. 실전 활용처 확정: 민감 문서 Q&A 또는 대량 배치 처리(태깅·요약)
2. Qwen3.6 35B A3B로 모델 업그레이드 비교
3. 외부 접속: LM Studio Locally 앱(iOS), 확장하면 텔레그램 브리지
4. ADK 확장: MCP 도구(`MCPToolset`), `adk run` 자동화, Cloud Run 배포
5. 회사 서버판: vLLM(GPU) + AnythingLLM Docker/Open WebUI. 회사용 모델은
   라이선스상 Qwen(Apache 2.0) 권장

마지막으로 자주 쓰는 명령을 모아둡니다.

```bash
adklab                                  # ADK 작업 시작
adk web                                 # 개발 UI (localhost:8000)
open http://localhost:1234/v1/models    # LM Studio 서버·모델 ID 확인
python -c "import weather_agent.agent"  # 에이전트 로딩 디버그
```
