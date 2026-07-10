---
name: deploy
description: 변경 사항을 커밋하고 main에 push해 GitHub Actions 배포를 트리거한다. 사용자가 "배포해줘", "배포", "deploy", "올려줘" 등을 요청할 때 사용.
---

# 배포

이 프로젝트는 `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해 GitHub Pages로 배포한다. 즉 배포 = 커밋 + push.

## 절차

1. **변경 확인**: `git status`와 `git diff`로 변경 사항을 파악한다. 변경이 없으면 배포할 것이 없다고 알리고 끝낸다. 의도치 않은 파일(임시 파일, 비밀 정보 등)이 섞여 있으면 커밋 전에 사용자에게 확인한다.
2. **빌드 검증**: `npm run build`를 실행해 빌드가 깨지지 않는지 확인한다. 실패하면 push하지 않고 에러를 보고한다.
3. **커밋**: 변경 내용에 맞는 접두어로 한국어 커밋 메시지를 작성한다. 최근 커밋 스타일을 따른다 (예: `post: 글 제목 추가`, `docs: ...`, `fix: ...`, `style: ...`).
4. **Push**: `git push origin main`.
5. **배포 확인**: `gh run watch`(또는 `gh run list --limit 1` 후 해당 run watch)로 GitHub Actions 워크플로우가 성공하는지 지켜본다. 실패하면 `gh run view --log-failed`로 원인을 파악해 보고한다.
6. **보고**: 커밋 해시, 워크플로우 결과, 배포된 사이트 URL을 알린다.

## 주의사항

- 현재 브랜치가 `main`이 아니면 사용자에게 확인한다. 임의로 브랜치를 옮기거나 머지하지 않는다.
- 커밋 대상은 명시적으로 지정한다 (`git add <파일>`). `git add -A`로 무엇이 들어가는지 모른 채 커밋하지 않는다.
- force push 금지.
