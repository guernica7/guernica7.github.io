<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <Layout>
    <!-- 각 글 본문(H1) 위에 frontmatter.date 를 자동으로 표시 -->
    <template #doc-before>
      <div v-if="frontmatter.date" class="post-meta">
        <time>{{ formatDate(frontmatter.date) }}</time>
      </div>
    </template>
  </Layout>
</template>
