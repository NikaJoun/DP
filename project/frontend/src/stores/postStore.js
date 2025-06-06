import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const usePostStore = defineStore('posts', () => {
  const posts = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  const publishedPosts = computed(() => {
    return posts.value.filter(post => post.status !== 'draft')
  })

  const draftPosts = computed(() => {
    return posts.value.filter(post => post.status === 'draft')
  })

  async function fetchUserPosts(userId = 'user-posts') {
    isLoading.value = true
    error.value = null
    const token = localStorage.getItem('token')
    
    try {
      const response = await axios.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      posts.value = response.data.map(post => ({
        ...post,
        rating: Number(post.rating) || 0
      }))
    } catch (err) {
      error.value = err.response?.data?.error || 'Ошибка загрузки публикаций'
      console.error('Error fetching posts:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function deletePost(postId) {
    const token = localStorage.getItem('token')
    try {
      await axios.delete(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      posts.value = posts.value.filter(post => post.id !== postId)
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  async function publishPost(postId) {
    const token = localStorage.getItem('token')
    try {
      await axios.patch(`/api/posts/${postId}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchUserPosts()
    } catch (error) {
      console.error('Error publishing post:', error)
      throw error
    }
  }

  function formatRating(rating) {
    const numRating = Number(rating)
    if (isNaN(numRating)) return 'Нет оценок'
    return numRating > 0 ? numRating.toFixed(1) : 'Нет оценок'
  }

  return {
    posts,
    publishedPosts,
    draftPosts,
    isLoading,
    error,
    fetchUserPosts,
    deletePost,
    publishPost,
    formatRating
  }
})