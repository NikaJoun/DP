<template>
   <div class="posts-controls">
    <div class="search-sort-container">
      <div class="search-box">
        <i class="bi bi-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Поиск по названию..." 
          class="search-input"
        >
      </div>
      <div class="sort-options">
        <label>Период:</label>
        <select v-model="timePeriod" class="sort-select">
          <option value="all">Все время</option>
          <option value="day">Сегодня</option>
          <option value="week">За 7 дней</option>
          <option value="month">За 30 дней</option>
          <option value="year">За год</option>
        </select>
      </div>
    </div>

    <div class="posts-list">
      <div v-if="filteredPosts.length === 0" class="no-posts">
        Посты не найдены
      </div>
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-content">
          <h3 class="post-title">
            <router-link :to="'/post/' + post.id">{{ post.title }}</router-link>
          </h3>
          <div v-if="post.task_id && post.task_title" class="task-info">
            <i class="bi bi-calendar-event"></i>
            <router-link :to="'/event-task/' + Number(post.event_id)" class="event-link">
              {{ post.event_title }}
            </router-link> 
            → Задание №{{ post.task_number }}. {{ post.task_title }}
          </div>
          <div class="post-meta">
            <span class="date"><i class="bi bi-calendar"></i> {{ formatDate(post.created_at) }}</span>
            <span class="views"><i class="bi bi-eye"></i> {{ post.views }}</span>
            <span class="rating"><i class="bi bi-star-fill"></i> {{ formatRating(post.rating) }}</span>
          </div>
        </div>
        <div class="post-actions">
          <router-link 
            :to="{ 
              path: '/create-post', 
              query: { 
                postId: post.id 
              } 
            }" 
            class="btn-action edit"
            title="Редактировать"
          >
            <i class="bi bi-pencil"></i>
          </router-link>
          <button 
            class="btn-action delete"
            title="Удалить"
            @click="$emit('delete', post.id)"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref } from 'vue'
import { usePostStore } from '@/stores/postStore'

const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
})

defineEmits(['delete'])

const { formatRating } = usePostStore()

const searchQuery = ref('')
const timePeriod = ref('all')

const filteredPosts = computed(() => {
  let result = [...props.posts]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(post => 
      post.title.toLowerCase().includes(query)
    )
  }
  
  if (timePeriod.value !== 'all') {
    const now = new Date()
    let startDate = new Date(now)
    
    switch (timePeriod.value) {
      case 'day':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        startDate.setDate(now.getDate())
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    result = result.filter(post => {
      if (!post.created_at) return false
      const postDate = new Date(post.created_at)
      return postDate >= startDate
    })
  }
  
  return result.sort((a, b) => {
    const dateA = new Date(a.created_at || 0)
    const dateB = new Date(b.created_at || 0)
    return dateB - dateA
  })
})

function formatDate(dateString) {
  if (!dateString) return 'Дата неизвестна'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('ru-RU', options)
}
</script>

<style scoped>
.posts-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-sort-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-box {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: white;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: white;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-options label {
  color: rgba(255, 255, 255, 0.8);
}

.sort-select {
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
}

.post-meta .date {
  margin-right: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.posts-list {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1rem;
  max-height: 350px;
  overflow-y: auto;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.posts-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.posts-list::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 4px;
}

.posts-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: content-box;
}

.posts-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
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

.post-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.btn-action {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(255, 255, 255, 0.6);
}

.btn-action:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.task-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.task-info i {
  font-size: 0.8rem;
}

.event-link {
  color: #6ab7ff;
  text-decoration: none;
}

.event-link:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .search-sort-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .post-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .post-actions {
    justify-content: flex-end;
  }
}
</style>