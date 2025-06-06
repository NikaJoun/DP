import { defineStore } from 'pinia'
import axios from 'axios'
import { useNotificationStore } from './notificationStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    message: ''
  }),
  actions: {
    async registerUser({ username, phone, password }) {
      try {
        this.message = ''
        const response = await axios.post('/api/register', { 
          username: username.trim(),
          phone: phone.trim(),
          password 
        })
        
        this.message = response.data.message || 'Регистрация прошла успешно'
        return { success: true }
      } catch (error) {
        let errorMessage = 'Ошибка регистрации'
        if (error.response?.status === 409) {
          errorMessage = 'Пользователь с таким телефоном уже существует'
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
        this.message = errorMessage
        return { success: false, error: errorMessage }
      }
    },

    async loginUser(phone, password) {
      try {
        this.message = ''
        const response = await axios.post('/api/login', { 
          phone: phone.trim(), 
          password 
        })
        
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))
        
        const notificationStore = useNotificationStore()
        notificationStore.setupNotifications()
        
        return true
      } catch (error) {
        const errorMsg = error.response?.data?.error || 
                       'Неправильно введен логин или пароль'
        
        this.message = errorMsg
        throw new Error(this.message)
      }
    },
    async loginWithTelegram() {
      return new Promise((resolve) => {
        resolve(false); 
      });
    },

    async verifyTelegramCode(code) {
      try {
        const response = await axios.get('/api/verify-tg-code', { params: { code } });
        
        this.token = response.data.token;
        this.user = response.data.user;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        
        const notificationStore = useNotificationStore();
        notificationStore.setupNotifications();
        
        this.message = `Добро пожаловать, ${this.user.username}!`;
        return true;
      } catch (error) {
        this.message = error.response?.data?.error || 'Ошибка авторизации';
        return false;
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token
  }
})