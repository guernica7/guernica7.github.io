import { defineConfig } from 'vitepress'

// <username>.github.io (user site) 배포이므로 base 는 '/' 그대로 둡니다.
// 저장소 이름을 다르게 쓰는 project site(예: <username>.github.io/blog)라면
// 아래 defineConfig 안에 base: '/저장소이름/' 을 추가하세요.
export default defineConfig({
  lang: 'ko-KR',
  title: 'guernica_dev',
  description: '기록하고, 배우고, 공유합니다.',

  // 기본은 다크, 우측 상단 토글로 라이트 모드 전환 가능.
  appearance: 'dark',

  cleanUrls: true,
  lastUpdated: true,
  srcExclude: ['README.md'],

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap'
      }
    ],

    // Google Analytics (GA4)
    [
      'script',
      { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-ZYBSXCCZ2H' }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-ZYBSXCCZ2H');`
    ]
  ],

  themeConfig: {
    nav: [{ text: '블로그', link: '/' }],

    // 본인 GitHub 주소로 교체하세요.
    socialLinks: [{ icon: 'github', link: 'https://github.com/guernica7' }],

    footer: {
      copyright: '© 2026 guernica7. All rights reserved.'
    },

    // 문서형 사이드바는 쓰지 않으므로 검색만 가볍게.
    search: { provider: 'local' },

    outline: { level: [2, 3], label: '목차' },
    lastUpdatedText: '마지막 수정',
    docFooter: { prev: '이전 글', next: '다음 글' }
  }
})
