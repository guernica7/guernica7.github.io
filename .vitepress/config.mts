import { defineConfig, createContentLoader, type SiteConfig } from 'vitepress'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const hostname = 'https://guernica7.github.io'

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

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
  srcExclude: ['README.md', 'CLAUDE.md'],

  sitemap: { hostname },

  // 빌드 완료 후 posts/*.md의 frontmatter로 RSS 피드(feed.xml)를 생성한다.
  buildEnd: async (config: SiteConfig) => {
    const posts = (
      await createContentLoader('posts/*.md', { render: true }).load()
    )
      .filter((p) => p.frontmatter.title && p.frontmatter.date)
      .sort((a, b) => +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date))

    const items = posts
      .map((p) => {
        const link = `${hostname}${p.url}`
        return [
          '    <item>',
          `      <title>${escapeXml(p.frontmatter.title)}</title>`,
          `      <link>${link}</link>`,
          `      <guid isPermaLink="true">${link}</guid>`,
          `      <pubDate>${new Date(p.frontmatter.date).toUTCString()}</pubDate>`,
          p.frontmatter.description
            ? `      <description>${escapeXml(p.frontmatter.description)}</description>`
            : null,
          p.html
            ? `      <content:encoded><![CDATA[${p.html.replaceAll(']]>', ']]]]><![CDATA[>')}]]></content:encoded>`
            : null,
          '    </item>'
        ]
          .filter(Boolean)
          .join('\n')
      })
      .join('\n')

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>guernica_dev</title>
    <link>${hostname}/</link>
    <description>기록하고, 배우고, 공유합니다.</description>
    <language>ko</language>
    <atom:link href="${hostname}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`
    writeFileSync(path.join(config.outDir, 'feed.xml'), feed)
  },

  head: [
    // 파비콘
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],

    // RSS 자동 발견
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: 'guernica_dev RSS', href: '/feed.xml' }],

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
