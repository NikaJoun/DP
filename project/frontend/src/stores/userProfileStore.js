import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale/ru'

export const useUserProfileStore = defineStore('userProfile', () => {
  const user = ref(null)
  const userPosts = ref([])
  const followersCount = ref(0)
  const subscriptionsCount = ref(0)
  const isSubscribed = ref(false)
  const error = ref(null)
  
  const userAvatar = computed(() => {
    return user.value?.avatar || '/default-avatar.png'
  })
  
  const formattedJoinDate = computed(() => {
    if (!user.value?.created_at) return ''
    return format(new Date(user.value.created_at), 'dd MMMM yyyy', { locale: ru })
  })

   const loadUserProfile = async (userId) => {
    try {
      const response = await axios.get(`/api/user/${userId}`);
      const userData = response.data;
      
      user.value = {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
        about: userData.about,
        created_at: userData.created_at
      };
      
      followersCount.value = Number(userData.followersCount);
      subscriptionsCount.value = Number(userData.subscriptionsCount);
      userPosts.value = userData.posts || [];
      
      if (localStorage.getItem('token')) {
        await checkSubscription(userId);
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Не удалось загрузить профиль';
      console.error('Ошибка загрузки профиля:', err);
    }
  }

  async function toggleSubscription(userId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      const currentlySubscribed = isSubscribed.value;
      
      const response = await axios({
        method: currentlySubscribed ? 'delete' : 'post',
        url: `/api/user/${userId}/${currentlySubscribed ? 'unsubscribe' : 'subscribe'}`,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        isSubscribed.value = !currentlySubscribed;
        
        if (currentlySubscribed) {
          followersCount.value = Math.max(0, followersCount.value - 1);
        } else {
          followersCount.value += 1;
        }
        
        return true;
      }
      
      throw new Error(response.data.error || 'Ошибка при изменении подписки');
    } catch (error) {
      console.error('Ошибка изменения подписки:', error);
      throw error;
    }
  }

  async function checkSubscription(userId) {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/user/${userId}/check-subscription`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      isSubscribed.value = response.data.isSubscribed
    } catch (err) {
      console.error('Ошибка проверки подписки:', err)
    }
  }

  return {
    user,
    userPosts,
    followersCount,
    subscriptionsCount,
    isSubscribed,
    error,
    userAvatar,
    formattedJoinDate,
    loadUserProfile,
    toggleSubscription,
    checkSubscription
  }
})