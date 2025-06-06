import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useSearchStore = defineStore('search', () => {
  const posts = ref([])
  const message = ref('')
  const searchQuery = ref('')
  const isLoading = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(12)
  const periodFilter = ref('')
  const sortOption = ref('newest')
  const pagination = ref({
    totalPages: 1,
    totalPosts: 0
  })

  const filteredPosts = computed(() => {
    return posts.value.map(post => ({
      ...post,
      cover_image: post.cover_image || '/default-cover.png'
    }))
  })

  const popularPosts = computed(() => {
    return [...filteredPosts.value]
      .sort((a, b) => (b.views || 0) - (a.views || 0) || (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
  })

  async function fetchPosts(query = '', sort = 'newest', period = '', page = 1) {
    try {
      isLoading.value = true;
      message.value = '';
      searchQuery.value = query;
      periodFilter.value = period;
      sortOption.value = sort;
      currentPage.value = parseInt(page) || 1;
      
      const response = await axios.get('/api/posts', {
        params: {
          query: query || undefined,
          sort: sort !== 'newest' ? sort : undefined,
          period: period || undefined,
          page: currentPage.value, 
          limit: itemsPerPage.value
        }
      });
      
      if (!response.data || !response.data.posts) {
        throw new Error('Некорректный формат ответа от сервера')
      }
      
      posts.value = response.data.posts.map(post => ({
        ...post,
        rating: post.rating !== null && post.rating !== undefined 
          ? Number(parseFloat(post.rating).toFixed(1)) 
          : null,
        cover_image: post.cover_image || '/default-cover.png'
      }));
      
      if (response.data.pagination) {
        pagination.value = {
          totalPages: response.data.pagination.totalPages,
          totalPosts: response.data.pagination.totalPosts
        };
        itemsPerPage.value = response.data.pagination.itemsPerPage;
      }
      
      if (posts.value.length === 0) {
        message.value = query 
          ? 'Ничего не найдено по вашему запросу' 
          : 'Публикаций пока нет'
      }
    } catch (error) {
      console.error('Ошибка при загрузке публикаций:', error)
      message.value = error.response?.data?.message || 
                    error.message || 
                    'Произошла ошибка при загрузке публикаций'
      posts.value = []
      pagination.value = {
        totalPages: 1,
        totalPosts: 0
      }
    } finally {
      isLoading.value = false
    }
  }

  const paginatedPosts = computed(() => {
    return filteredPosts.value
  })
  
  const totalPages = computed(() => {
    return pagination.value.totalPages
  })
  
  function setPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      fetchPosts(
        searchQuery.value,
        sortOption.value,
        periodFilter.value,
        page
      )
    }
  }

  async function resetSearch() {
    searchQuery.value = ''
    periodFilter.value = ''
    sortOption.value = 'newest'
    await fetchPosts()
  }

  return { 
    posts,
    message,
    searchQuery,
    isLoading,
    filteredPosts,
    popularPosts,
    fetchPosts,
    resetSearch,
    currentPage,
    itemsPerPage,
    paginatedPosts,
    totalPages,
    setPage,
    periodFilter,
    sortOption,
    pagination
  }
})