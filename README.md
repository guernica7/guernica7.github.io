# devlog

> 마크다운으로 쓰고, push 하면 끝.

미니멀 다크 블로그. 글쓰기 외의 모든 것은 자동화되어 있다.

**[guernica7.github.io](https://guernica7.github.io)** · VitePress · GitHub Pages

## 동작 원리

```
posts/*.md ──▶ posts.data.ts ──▶ BlogIndex.vue ──▶ 홈 목록
    │              (수집·정렬)         (렌더링)
    └── frontmatter: title / date / description
```

`main`에 push → GitHub Actions 빌드 → Pages 배포. 사람이 하는 일은 글쓰기뿐.

## 글 하나 = 파일 하나

```md
---
title: 글 제목
date: 2026-07-10
description: 홈 목록에 보일 한 줄.
---

# 글 제목

본문...
```

`posts/`에 저장하면 홈에 최신순으로 자동 등록된다. 그게 전부다.

## 명령어

| | |
|---|---|
| `npm run dev` | 개발 서버 → localhost:5173 |
| `npm run build` | 정적 빌드 → `.vitepress/dist` |
| `npm run preview` | 빌드 결과 미리보기 |

## 손대는 곳

- 색·폰트 — [`style.css`](.vitepress/theme/style.css) · 앰버 액센트, Space Grotesk + JetBrains Mono
- 홈 목록 UI — [`BlogIndex.vue`](.vitepress/theme/BlogIndex.vue)
- 글 상단 날짜 — [`Layout.vue`](.vitepress/theme/Layout.vue)
- 제목·nav — [`config.mts`](.vitepress/config.mts)

다크 전용(`force-dark`). 라이트 모드는 없고, 앞으로도 없다.

## 포크해서 쓰려면

저장소 이름을 `<username>.github.io`로 만들고 push, Settings → Pages에서
Source를 **GitHub Actions**로. project site라면 `config.mts`에
`base: '/저장소이름/'`만 추가하면 된다.
