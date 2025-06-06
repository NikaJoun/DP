import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const usePostDetailStore = defineStore('postDetail', () => {
  const post = ref(null)
  const comments = ref([])
  const error = ref(null)
  const isLoading = ref(false)
  
  const postRating = computed(() => {
    if (post.value?.rating !== undefined && post.value?.rating !== null) {
      return parseFloat(post.value.rating)
    }
    
    if (comments.value.length > 0) {
      const total = comments.value.reduce((sum, comment) => sum + comment.rating, 0)
      return parseFloat((total / comments.value.length).toFixed(1))
    }
    
    return 0
  })
  
  const ratingClass = computed(() => ({
    'text-success': postRating.value >= 4,
    'text-warning': postRating.value >= 2 && postRating.value < 4,
    'text-danger': postRating.value < 2
  }))

  async function fetchPost(postId) {
    isLoading.value = true
    error.value = null
    const token = localStorage.getItem('token')
    
    try {
      await axios.patch(`/api/posts/${postId}/views`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const response = await axios.get(`/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      post.value = response.data
    } catch (err) {
      error.value = 'Не удалось загрузить публикацию. Попробуйте позже.'
      console.error('Ошибка при загрузке публикации', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchComments(postId) {
    isLoading.value = true
    const token = localStorage.getItem('token')
    
    try {
      const response = await axios.get(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      comments.value = response.data
    } catch (err) {
      console.error('Ошибка при загрузке комментариев', err)
    } finally {
      isLoading.value = false
    }
  }

  async function submitComment(postId, commentData) {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    
    try {
        const response = await axios.post(`/api/posts/${postId}/comments`, {
        ...commentData,
        rating: parseInt(commentData.rating)
        }, {
        headers: { Authorization: `Bearer ${token}` }
        });
        
        comments.value.unshift(response.data.comment);
        if (response.data.updatedPost) {
        post.value = response.data.updatedPost;
        }
        
        return { liked: '', disliked: '', overall_impression: '', rating: 5 };
    } catch (err) {
        error.value = 'Не удалось отправить комментарий. Попробуйте позже.';
        console.error('Ошибка при отправке комментария:', err.response?.data || err.message);
        throw err;
    } finally {
        isLoading.value = false;
    }
    }

  return {
    post,
    comments,
    error,
    isLoading,
    postRating,
    ratingClass,
    fetchPost,
    fetchComments,
    submitComment
  }
})