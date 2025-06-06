<template>
  <div class="section">
    <div class="section-header">
      <h2>{{ title }}</h2>
    </div>

    <div v-if="posts.length" class="posts-list">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-content">
          <h3 class="post-title">
            <router-link :to="'/post/' + post.id">{{ post.title }}</router-link>
          </h3>
          
          <div v-if="post.task_id && post.task_title" class="post-task-info">
            <i class="bi bi-calendar-event"></i>
            <router-link 
              v-if="post.event_id"
              :to="'/event-task/' + post.event_id" 
              class="event-link"
            >
              {{ post.event_title }}
            </router-link>
            <span v-else>{{ post.event_title }}</span>
            → Задание №{{ post.task_number }}. {{ post.task_title }}

          </div>
          
          <div class="post-meta">
            <span class="views"><i class="bi bi-eye"></i> {{ post.views }}</span>
            <span class="rating"><i class="bi bi-star-fill"></i> {{ formatRating(post.rating) }}</span>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else :icon="'bi-journal-text'">
      {{ emptyText }}
    </EmptyState>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import EmptyState from './EmptyState.vue'

defineProps({
  posts: {
    type: Array,
    default: () => [],
    validator: (posts) => {
      return posts.every(post => {
        const valid = typeof post === 'object' && 'id' in post && 'title' in post
        if (!valid) {
          console.warn('Invalid post structure:', post)
        }
        return valid
      })
    }
  },
  title: String,
  emptyText: String
})

const formatRating = (rating) => {
  if (rating === null || rating === undefined) return 'Нет оценок'
  const numRating = Number(rating)
  return isNaN(numRating) ? 'Нет оценок' : numRating > 0 ? numRating.toFixed(1) : 'Нет оценок'
}
</script>

<style scoped>
.section {
  margin-bottom: 1rem;
}

.section-header {
  margin: 1.5rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  font-size: 1.3rem;
  color: #fff;
  margin: 0;
}

.posts-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.post-card {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1rem;
}

.post-card:last-child {
  margin-bottom: 0;
}

.post-card:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.post-content {
  flex: 1;
}

.post-title {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.post-title a {
  color: #fff;
  text-decoration: none;
}

.post-title a:hover {
  text-decoration: underline;
}

.post-meta {
  display: flex;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.post-meta i {
  margin-right: 3px;
}

.post-task-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.post-task-info i {
  font-size: 0.8rem;
  color: #6ab7ff;
}

.task-meta i {
  margin-right: 5px;
  color: #6ab7ff;
}

.event-link {
  color: #6ab7ff;
  text-decoration: none;
}

.event-link:hover {
  text-decoration: underline;
}

.task-link {
  color: #a78bfa;
  text-decoration: none;
}

.task-link:hover {
  text-decoration: underline;
}
</style>