<template>
  <div class="search-container">
    <div class="search-input-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        class="search-input" 
        placeholder="Продолжите поиск..."
        @keyup.enter="handleSearch"
      >
      <button class="search-button" @click="handleSearch">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
        </svg>
      </button>
    </div>
    
    <div class="filters-container">
      <select v-model="periodOption" @change="handlePeriodChange" class="sort-select">
        <option value="">Все время</option>
        <option value="today">Сегодня</option>
        <option value="week">За 7 дней</option>
        <option value="month">За 30 дней</option>
        <option value="year">За год</option>
      </select>
      
      <select v-model="sortOption" @change="handleSortChange" class="sort-select">
        <option value="newest">Сначала новые</option>
        <option value="oldest">Сначала старые</option>
        <option value="popular">Популярные</option>
        <option value="rating">Высокий рейтинг</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchQuery = ref(route.query.query || '')
const sortOption = ref(route.query.sort || 'newest')
const periodOption = ref(route.query.period || '')

watch(() => route.query.query, (newVal) => {
  searchQuery.value = newVal || ''
})

watch(() => route.query.sort, (newVal) => {
  sortOption.value = newVal || 'newest'
})

watch(() => route.query.period, (newVal) => {
  periodOption.value = newVal || ''
})

function handleSearch() {
  router.push({ 
    path: '/posts', 
    query: { 
      query: searchQuery.value.trim() || undefined,
      sort: sortOption.value !== 'newest' ? sortOption.value : undefined,
      period: periodOption.value || undefined,
      page: undefined 
    }
  });
}


function handleSortChange() {
  handleSearch()
}

function handlePeriodChange() {
  handleSearch()
}
</script>

<style scoped>
.search-container {
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
}

.search-input-container {
  position: relative;
  flex-grow: 1;
}

.sort-select {
  padding: 12px 20px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid #ced4da;
  font-size: 1rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  margin-left: .5rem;
}

.sort-select:focus {
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.50);
  padding: 12px 50px 12px 20px;
  border-radius: 30px;
  transition: all 0.3s ease;
  border: 1px solid #ced4da;
  font-size: 1.1rem;
  height: 50px;
}

.search-input:focus {
  background: rgba(255, 255, 255, 1);
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.search-button {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 8px;
}

.search-button:hover {
  color: #495057;
}

.search-button svg {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .sort-select {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .search-input {
    font-size: 0.9rem;
    padding: 8px 35px 8px 12px;
    height: 40px;
  }
  
  .search-button svg {
    width: 16px;
    height: 16px;
  }
  
  .sort-select {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
}
</style>