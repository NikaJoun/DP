<template>
  <div v-if="showModal" class="notification-modal" @click.self="closeModal">
    <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <header class="modal-header">
        <h2 id="modalTitle">Уведомления</h2>
        <button @click="closeModal" class="close-btn" aria-label="Закрыть окно">
          <i class="bi bi-x-lg"></i>
        </button>
      </header>
      <section class="modal-body">
        <div v-if="isLoading" class="loading-notifications">
          <i class="bi bi-arrow-repeat spin"></i> Загрузка...
        </div>
        <div v-else-if="notifications.length === 0" class="empty-notifications">
          Нет новых уведомлений
        </div>
        <div v-else>
          <ul class="notification-list">
            <li v-for="notification in notifications" 
                :key="notification.id" 
                class="notification-item"
                :class="{ unread: !notification.is_read }"
                tabindex="0">
              <div class="notification-content">
                <span v-html="formatNotificationMessage(notification)"></span>
                <time class="text-muted" :datetime="notification.createdAt">{{ formatDate(notification.createdAt) }}</time>
              </div>
              <button v-if="!notification.is_read" 
                      @click="markAsRead(notification.id)"
                      class="mark-read-btn"
                      title="Пометить как прочитанное"
                      aria-label="Пометить уведомление как прочитанное">
                <i class="bi bi-check-circle"></i>
              </button>
            </li>
          </ul>
          <button @click="markAllAsRead" class="mark-all-read-btn">
            Пометить все как прочитанные
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notificationStore';

const router = useRouter();
const notificationStore = useNotificationStore();

const showModal = computed(() => notificationStore.showModal);
const notifications = computed(() => notificationStore.notifications);
const isLoading = computed(() => notificationStore.isLoading);

const closeModal = () => {
  notificationStore.toggleModal();
};

const markAsRead = (id) => {
  notificationStore.markAsRead(id);
};

const markAllAsRead = () => {
  notificationStore.markAllAsRead();
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const formatNotificationMessage = (notification) => {
  if (!notification.sender || !notification.senderId) {
    return notification.message;
  }

  const escapedUsername = escapeHtml(notification.sender);
  const message = notification.message.replace(
    escapedUsername,
    `<a href="#" class="user-link" data-user-id="${notification.senderId}">${escapedUsername}</a>`
  );
  
  return message;
};

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handleUserLinkClick = (e) => {
  if (e.target.classList.contains('user-link')) {
    e.preventDefault();
    const userId = e.target.getAttribute('data-user-id');
    if (userId) {
      closeModal();
      router.push(`/user/${userId}`);
    }
  }
};

import { onMounted, onUnmounted } from 'vue';

onMounted(() => {
  document.addEventListener('click', handleUserLinkClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleUserLinkClick);
});
</script>

<style scoped>
.notification-modal {
  position: fixed;
  bottom: 50px;
  left: 50px;
  width: 360px;
  max-height: calc(100vh - 80px);
  background: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-radius: 12px;
  z-index: 2500;
  display: flex;
  flex-direction: column;
  animation: fadeInScale 0.2s ease forwards;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* overflow: hidden; */
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
  color: #222;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: #555;
  cursor: pointer;
  transition: color 0.2s ease;
}

.close-btn:hover,
.close-btn:focus {
  color: #0d6efd;
  outline: none;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.loading-notifications,
.empty-notifications {
  text-align: center;
  color: #888;
  font-size: 1rem;
  padding: 40px 0;
  user-select: none;
}

.spin {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: default;
  transition: background-color 0.15s ease;
}

.notification-item.unread {
  background-color: #e9f0ff;
  font-weight: 600;
}

.notification-item:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
  background-color: #dbe9ff;
}

.notification-content {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.3;
}

.notification-content span a.user-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: 600;
  transition: text-decoration 0.2s ease;
}

.notification-content span a.user-link:hover,
.notification-content span a.user-link:focus {
  text-decoration: underline;
  outline: none;
}

.text-muted {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: #777;
}

.mark-read-btn {
  background: transparent;
  border: none;
  color: #6c757d;
  cursor: pointer;
  margin-left: 12px;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.mark-read-btn:hover,
.mark-read-btn:focus {
  color: #0d6efd;
  outline: none;
}

.mark-all-read-btn {
  width: 100%;
  padding: 10px 0;
  margin-top: 16px;
  border: none;
  background-color: #0d6efd;
  color: #fff;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.25s ease;
}

.mark-all-read-btn:hover,
.mark-all-read-btn:focus {
  background-color: #0b5ed7;
  outline: none;
}
</style>