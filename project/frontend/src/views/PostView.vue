<template>
  <div class="search-page">
    <div class="search-section">
      <SearchInput />
    </div>

    <div v-if="store.isLoading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Загрузка...</span>
    </div>

    <div v-else class="posts-container-wrapper">
      <div v-if="store.paginatedPosts.length > 0" class="posts-grid-container">
        <div class="posts-grid">
          <PostCard 
            v-for="post in store.paginatedPosts" 
            :key="post.id" 
            :post="post" 
          />
        </div>
        
        <div class="pagination" v-if="store.pagination.totalPages > 1">
          <button 
            @click="store.setPage(store.currentPage - 1)"
            :disabled="store.currentPage === 1"
            class="pagination-button"
          >
            Назад
          </button>
          
          <span class="page-info">
            Страница {{ store.currentPage }} из {{ store.pagination.totalPages }}
          </span>
          
          <button 
            @click="store.setPage(store.currentPage + 1)"
            :disabled="store.currentPage === store.pagination.totalPages"
            class="pagination-button"
          >
            Вперед
          </button>
        </div>
      </div>
      <p v-else class="empty-message">{{ store.message || 'Ничего не найдено' }}</p>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from '@/stores/searchStore'
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SearchInput from '@/components/search/SearchInput.vue'
import PostCard from '@/components/search/PostCard.vue'

const store = useSearchStore()
const route = useRoute()

onMounted(() => {
  updateFromRoute();
});

watch(() => route.query, () => {
  updateFromRoute();
}, { immediate: true });

function updateFromRoute() {
  store.fetchPosts(
    route.query.query || '',
    route.query.sort || 'newest',
    route.query.period || '',
    route.query.page || 1
  );
}
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.search-section {
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.posts-container-wrapper {
  margin-top: 2rem;
  flex-grow: 1;
}

.posts-grid-container {
  width: 100%;
  /* overflow: hidden; */
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-rows: auto;
  grid-auto-flow: dense;
  gap: 1.5rem;
}

.empty-message {
  text-align: center;
  padding: 1.5rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination-button {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .search-section {
    width: 100%;
  }
  
  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .search-page {
    padding: 0.5rem;
  }
  
  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>