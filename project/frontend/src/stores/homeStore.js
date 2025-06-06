import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useHomeStore = defineStore('home', () => {
  const user = ref(null)
  const searchQuery = ref('')
  const nextEvent = ref(null)
  const newAuthors = ref([])
  const popularPosts = ref([])

  async function getUserInfo() {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        user.value = response.data
      } catch (error) {
        console.error('Ошибка при загрузке пользователя', error)
      }
    }
  }

  async function loadNextEvent() {
    try {
      const response = await axios.get('/api/events')
      const now = new Date();
      
      const activeEvent = response.data.find(e => 
        new Date(e.start_date) <= now && new Date(e.end_date) > now
      );
      
      if (activeEvent) {
        nextEvent.value = activeEvent;
      } else {
        const futureEvents = response.data.filter(e => new Date(e.start_date) > now);
        nextEvent.value = futureEvents.length
          ? futureEvents.sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0]
          : null;
      }
    } catch (error) {
      console.error('Ошибка при загрузке событий:', error);
    }
  }

  async function loadNewAuthors() {
    try {
      const response = await axios.get('/api/user/new-authors')
      newAuthors.value = response.data
    } catch (error) {
      console.error('Ошибка при загрузке новых авторов:', error)
    }
  }

  async function loadPopularPosts() {
    try {
      const response = await axios.get('/api/popular')
      popularPosts.value = response.data
    } catch (error) {
      console.error('Ошибка при загрузке популярных публикаций:', error)
    }
  }

  async function initData() {
    await Promise.all([
      getUserInfo(),
      loadNextEvent(),
      loadNewAuthors(),
      loadPopularPosts()
    ])
  }

  return {
    user,
    searchQuery,
    nextEvent,
    newAuthors,
    popularPosts,
    getUserInfo,
    loadNextEvent,
    loadNewAuthors,
    loadPopularPosts,
    initData
  }
})