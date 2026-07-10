# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

VitePress로 만든 미니멀 개발 블로그(한국어, 다크 기본 + 라이트 토글). `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해 GitHub Pages(user site, `<username>.github.io`)로 배포한다. 유일한 의존성은 `vitepress`이며 테스트/린트 설정은 없다.

## 명령어

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 정적 빌드 → .vitepress/dist
npm run preview  # 빌드 결과 미리보기
```

## 아키텍처

글 목록이 렌더링되는 데이터 흐름:

1. `posts/*.md` — 각 글. frontmatter의 `title`, `date`, `description` 세 개가 필수 계약이다. `title`이나 `date`가 없으면 `posts.data.ts`의 필터에서 걸러져 홈 목록에 나타나지 않는다.
2. `posts.data.ts` — VitePress `createContentLoader`로 `posts/*.md`의 frontmatter를 수집해 날짜 내림차순 `Post[]`로 변환하는 빌드 타임 데이터 로더.
3. `.vitepress/theme/BlogIndex.vue` — 위 데이터를 import해 홈 글 목록 UI를 렌더링.
4. `index.md` — `layout: page`로 사이드바를 끄고 `<BlogIndex />`만 배치한 홈.

테마 커스터마이징 (`.vitepress/theme/`):

- `index.ts` — DefaultTheme을 extend하고 `BlogIndex`를 전역 컴포넌트로 등록, 커스텀 `Layout` 지정.
- `Layout.vue` — DefaultTheme Layout을 감싸 `doc-before` 슬롯으로 각 글 본문 위에 `frontmatter.date`를 자동 표시.
- `style.css` — 색(앰버 액센트)·폰트(Space Grotesk + JetBrains Mono) 오버라이드. 폰트는 `config.mts`의 `head`에서 Google Fonts로 로드.

## 주의사항

- **다크 기본 + 라이트 토글**: `config.mts`의 `appearance: 'dark'`. `style.css`에서 라이트 팔레트는 `:root`, 다크 팔레트는 `.dark` 스코프에 정의되어 있으므로 색상 변경 시 두 모드를 모두 반영한다.
- **base 경로**: user site(`<username>.github.io`) 배포라 `base`는 `/` 그대로 둔다. project site로 바꾸는 경우에만 `base: '/저장소이름/'` 추가.
- `cleanUrls: true`이므로 내부 링크에 `.html` 확장자를 붙이지 않는다.
- `lastUpdated`는 git 커밋 타임스탬프 기반이며, 이를 위해 CI에서 `fetch-depth: 0`으로 checkout한다.
- `README.md`는 `srcExclude`로 사이트 빌드에서 제외되어 있다.

## 새 글 작성

`posts/`에 `.md` 파일 생성 후 frontmatter를 채우면 홈 목록에 자동 등록된다:

```md
---
title: 글 제목
date: 2026-07-10
description: 홈 목록에 보일 한 줄 설명.
---

# 글 제목

본문...
```
