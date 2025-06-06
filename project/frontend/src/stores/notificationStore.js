import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    showModal: false,
    lastChecked: null,
    pollingInterval: null
  }),
  actions: {
    async fetchNotifications() {
      const auth = useAuthStore();
      if (!auth.token) return;

      this.isLoading = true;
      try {
        const response = await axios.get('/api/notification', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        
        if (response.data && response.data.success !== false) {
          const notifications = response.data.notifications || 
                              response.data.data || 
                              (Array.isArray(response.data) ? response.data : []);
          
          this.notifications = notifications.map(notif => ({
            id: notif.id,
            message: this.generateMessage(notif),
            is_read: Boolean(notif.is_read),
            createdAt: notif.created_at || notif.createdAt,
            type: notif.type,
            ...(notif.sender_username && { sender: notif.sender_username }),
            ...(notif.sender_id && { senderId: notif.sender_id }),
            ...(notif.post_title && { postTitle: notif.post_title })
          }));
          
          this.updateUnreadCount();
        } else {
          console.error('Неверный формат ответа:', response.data);
          this.notifications = [];
        }
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
        this.notifications = [];
        this.unreadCount = 0;
        
        if (error.response?.status === 401) {
          auth.logout();
        }
      } finally {
        this.isLoading = false;
      }
    },

    generateMessage(notification) {
      switch(notification.type) {
        case 'comment':
          return `${notification.sender_username || 'Кто-то'} прокомментировал вашу публикацию "${notification.post_title || ''}"`;
        case 'subscription':
          return `${notification.sender_username || 'Кто-то'} подписался на вас`;
        case 'system':
          return `У ${notification.sender_username || 'кого-то'} новая публикация! "${notification.post_title || ''}"`;
        default:
          return 'Новое уведомление';
      }
    },

    async markAsRead(notificationId) {
      const auth = useAuthStore();
      try {
        await axios.put(`/api/notification/${notificationId}/read`, {}, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (Array.isArray(this.notifications)) {
          this.notifications = this.notifications.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          );
          this.updateUnreadCount();
        }
      } catch (error) {
        console.error('Ошибка отметки прочтения:', error);
      }
    },

    async markAllAsRead() {
      const auth = useAuthStore();
      try {
        await axios.put('/api/notification/mark-all-read', {}, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (Array.isArray(this.notifications)) {
          this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
        }
        this.unreadCount = 0;
      } catch (error) {
        console.error('Ошибка отметки всех как прочитанных:', error);
      }
    },

    async checkNewNotifications() {
      const auth = useAuthStore();
      if (!auth.token || !this.lastChecked) return;

      try {
        const params = { lastChecked: this.lastChecked.toISOString() };
        const response = await axios.get('/api/notification/check-new', { 
          params,
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        return response.data;
      } catch (error) {
        console.error('Ошибка проверки новых уведомлений:', error);
        return { hasNew: false };
      }
    },

    async getUnreadCount() {
      const auth = useAuthStore();
      if (!auth.token) return;

      try {
        const response = await axios.get('/api/notification/unread-count', {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        this.unreadCount = response.data.count || 0;
      } catch (error) {
        console.error('Ошибка получения счетчика непрочитанных:', error);
        this.unreadCount = 0;
      }
    },

    updateUnreadCount() {
      if (Array.isArray(this.notifications)) {
        this.unreadCount = this.notifications.filter(n => n && !n.is_read).length;
      } else {
        this.unreadCount = 0;
        this.notifications = [];
      }
    },

    toggleModal() {
      this.showModal = !this.showModal;
      if (this.showModal) {
        this.lastChecked = new Date();
        this.fetchNotifications();
      }
    },

    initPolling() {
      this.clearPolling();
      
      this.pollingInterval = setInterval(async () => {
        if (!this.showModal && this.lastChecked) {
          try {
            const { hasNew } = await this.checkNewNotifications();
            if (hasNew) await this.getUnreadCount();
          } catch (error) {
            console.error('Ошибка polling:', error);
          }
        }
      }, 30000);
    },

    clearPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    setupNotifications() {
      this.getUnreadCount();
      this.initPolling();
    },

    resetNotifications() {
      this.clearPolling();
      this.notifications = [];
      this.unreadCount = 0;
      this.showModal = false;
    }
  },
  getters: {
    hasUnread: (state) => state.unreadCount > 0
  }
});