import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: string
  description: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/*.md', {
  transform(raw): Post[] {
    return raw
      .filter((page) => page.frontmatter.title && page.frontmatter.date)
      .map(({ url, frontmatter }) => ({
        title: frontmatter.title,
        url,
        date: frontmatter.date,
        description: frontmatter.description ?? ''
      }))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))
  }
})
