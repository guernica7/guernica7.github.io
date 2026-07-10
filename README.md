# devlog

VitePress로 만든 미니멀 다크 개발 블로그. 마크다운으로 쓰고 `git push` 하면
GitHub Actions가 빌드해 GitHub Pages로 배포합니다.

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 정적 빌드 (.vitepress/dist)
npm run preview  # 빌드 결과 미리보기
```

## 새 글 쓰기

`posts/` 에 `.md` 파일을 만들고 frontmatter 3개만 채우면 홈 목록에 최신순으로
자동 등록됩니다.

```md
---
title: 글 제목
date: 2026-07-10
description: 홈 목록에 보일 한 줄 설명.
---

# 글 제목

본문...
```

## GitHub Pages 배포 (`<username>.github.io`)

1. GitHub에서 저장소 이름을 **`<username>.github.io`** 로 만듭니다.
   (`<username>` 은 본인 GitHub 아이디. 예: 아이디가 `jin` 이면 `jin.github.io`)
2. 이 프로젝트를 그 저장소에 push 합니다. (기본 브랜치 `main`)
3. 저장소 **Settings → Pages → Build and deployment → Source** 를
   **GitHub Actions** 로 설정합니다.
4. `main` 에 push 하면 `.github/workflows/deploy.yml` 이 자동으로 빌드·배포하고,
   `https://<username>.github.io/` 에서 확인할 수 있습니다.

- user site 이므로 `.vitepress/config.mts` 의 `base` 는 `/` 그대로 둡니다.
- 저장소 이름을 다르게 쓰고 싶다면(project site, 예: `blog`) 주소가
  `https://<username>.github.io/blog/` 가 되므로 `base: '/blog/'` 를 추가해야 합니다.
- HTTPS 는 `*.github.io` 에서 기본 제공됩니다.

## 커스터마이징 포인트

- 색/폰트: `.vitepress/theme/style.css` (앰버 액센트, Space Grotesk + JetBrains Mono)
- 홈 목록 UI: `.vitepress/theme/BlogIndex.vue`
- 글 상단 날짜 표시: `.vitepress/theme/Layout.vue` (`doc-before` 슬롯)
- 사이트 제목·nav·GitHub 링크: `.vitepress/config.mts`
