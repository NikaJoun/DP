import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const followersCount = ref(0)
  const subscriptionsCount = ref(0)
  const message = ref('')
  
  const userAvatar = computed(() => {
    return user.value?.avatar || '/default-avatar.png'
  })

  async function fetchUserInfo(userId = 'profile') {
    const token = localStorage.getItem('token')
    if (!token) {
      message.value = 'Необходимо войти в систему.'
      return false
    }

    try {
      const response = await axios.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      user.value = response.data
      return true
    } catch (error) {
      message.value = error.response?.data?.error || 'Ошибка загрузки данных.'
      return false
    }
  }

  async function fetchUserStats(userId = 'user-stats') {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.get(`/api/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      followersCount.value = response.data.followers
      subscriptionsCount.value = response.data.subscriptions
    } catch (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }
  }

  async function updateProfile(updatedData) {
    const token = localStorage.getItem('token')
    try {
      await axios.put('/api/user/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchUserInfo()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  async function uploadAvatar(formData) {
    const token = localStorage.getItem('token')
    try {
      const response = await axios.post('/api/avatar/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      if (user.value) {
        user.value.avatar = response.data.avatar
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Не удалось загрузить аватарку')
    }
  }

  async function deleteAvatar() {
    const token = localStorage.getItem('token')
    try {
      await axios.delete('/api/avatar/delete', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (user.value) {
        user.value.avatar = null
      }
    } catch (error) {
      console.error('Ошибка при удалении аватарки:', error)
      throw error
    }
  }

  function logout() {
    localStorage.removeItem('token')
    user.value = null
  }

  return {
    user,
    followersCount,
    subscriptionsCount,
    message,
    userAvatar,
    fetchUserInfo,
    fetchUserStats,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    logout
  }
})