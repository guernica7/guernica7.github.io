<script setup lang="ts">
import { data as posts } from '../../posts.data'

function formatDate(raw: string): string {
  return new Date(raw).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="blog">
    <header class="blog-head">
      <h1 class="blog-title">guernica_dev<span class="cursor">_</span></h1>
      <p class="blog-sub">기록하고, 배우고, 공유합니다.</p>
    </header>

    <ul class="post-list">
      <li v-for="post in posts" :key="post.url" class="post-item">
        <a :href="post.url" class="post-link">
          <time class="post-date">{{ formatDate(post.date) }}</time>
          <h2 class="post-title">{{ post.title }}</h2>
          <p v-if="post.description" class="post-desc">{{ post.description }}</p>
        </a>
      </li>
    </ul>

    <p v-if="!posts.length" class="empty">아직 글이 없어요. <code>posts/</code> 에 마크다운을 추가하세요.</p>
  </div>
</template>
