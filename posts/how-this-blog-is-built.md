---
title: 이 블로그는 이렇게 만들었습니다
date: 2026-07-08
description: 미니멀 다크 테마, 자동 글 목록, GitHub Actions 배포까지.
---

# 이 블로그는 이렇게 만들었습니다

글 하나는 `posts/` 폴더의 마크다운 파일 하나입니다. 상단 frontmatter 에
`title`, `date`, `description` 세 가지만 채우면 홈 목록에 자동으로 최신순으로
정렬돼 나타납니다.

## 새 글 쓰는 법

1. `posts/` 에 `.md` 파일을 만든다.
2. frontmatter 를 채운다.
3. 본문을 마크다운으로 쓴다.
4. `git push` → GitHub Actions 가 빌드·배포한다.

그게 전부입니다.

## 목록은 어떻게 모이나

`posts.data.ts` 의 content loader 가 `posts/*.md` 를 훑어 날짜 역순으로 정렬합니다.
새 파일을 추가하면 목록에 자동으로 반영됩니다.
