<template>
  <nav class="sidebar">
    <div class="navbar-title">The Stars</div>

    <ul class="nav flex-column">
      <li class="nav-item">
        <router-link to="/" class="nav-link" title="Главная">
          <i class="bi bi-house-door"></i>
        </router-link>
      </li>
      <li v-if="!isAuthenticated" class="nav-item">
        <router-link to="/login" class="nav-link" title="Вход">
          <i class="bi bi-box-arrow-in-right"></i>
        </router-link>
      </li>
      <li v-if="isAuthenticated" class="nav-item">
        <router-link to="/profile" class="nav-link" title="Профиль">
          <i class="bi bi-person-circle"></i>
        </router-link>
      </li>
      <li v-if="isAuthenticated" class="nav-item">
        <router-link to="/create-post" class="nav-link" title="Создать публикацию">
          <i class="bi bi-file-earmark-plus"></i>
        </router-link>
      </li>
      <li class="nav-item">
        <router-link to="/posts" class="nav-link" title="Публикации">
          <i class="bi bi-card-list"></i>
        </router-link>
      </li>
      <li v-if="isAuthenticated" class="nav-item">
        <router-link to="/event-calendar" class="nav-link" title="Календарь событий">
          <i class="bi bi-calendar-event"></i>
        </router-link>
      </li>
      <li v-if="isAdmin" class="nav-item">
        <router-link to="/admin" class="nav-link" title="Админ-панель">
          <i class="bi bi-shield-lock"></i>
        </router-link>
      </li>
      <li v-if="isAuthenticated" class="nav-item">
        <a href="#" class="nav-link" title="Уведомления" @click.prevent="toggleNotifications">
          <i class="bi bi-bell-fill"></i>
          <span v-if="notificationStore.unreadCount > 0" class="notification-badge">
            {{ notificationStore.unreadCount }}
          </span>
        </a>
      </li>
    </ul>

    <NotificationModal />
  </nav>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import { useNotificationStore } from '@/stores/notificationStore';
import NotificationModal from '@/components/NotificationModal.vue';

export default {
  name: 'AppNavbar',
  components: {
    NotificationModal
  },
  data() {
    return {
      isAuthenticated: false,
      isAdmin: false,
      notificationStore: useNotificationStore()
    };
  },
  created() {
    this.checkAuthStatus();
  },
  methods: {
    checkAuthStatus() {
      const token = localStorage.getItem('token');
      this.isAuthenticated = !!token;

      if (token) {
        try {
          const decoded = jwtDecode(token);
          this.isAdmin = decoded.roleId === 1;
          localStorage.setItem('user', JSON.stringify({
            id: decoded.userId,
            roleId: decoded.roleId
          }));
          
          if (this.isAuthenticated) {
            this.notificationStore.setupNotifications();
          }
        } catch (error) {
          this.isAdmin = false;
        }
      }
    },
    toggleNotifications() {
      this.notificationStore.toggleModal();
    }
  },
  watch: {
    '$route'() {
      this.checkAuthStatus();
    }
  },
  beforeUnmount() {
    this.notificationStore.clearPolling();
  }
};
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 60px;
  background: transparent;
  padding-top: 20px;
  box-shadow: none;
  z-index: 1000;
  transition: width 0.3s ease;
}

.navbar-title {
  font-family: 'Hatigek Batagor', sans-serif;
  font-size: 1.6rem;
  font-weight: bold;
  color: #EADDC3;
  margin-bottom: 20px;
  padding-left: 5px;
  text-align: center;
  white-space: nowrap;
  overflow: visible;
  display: block;
}

.nav-item {
  border-bottom: 1px solid #7f8c8d;
  background: #00000020;
  backdrop-filter: blur(10px);
}

.nav-item:last-child {
  border-bottom: none;
}

.nav-link {
  font-size: 1.5rem;
  color: #ecf0f1;
  padding: 15px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  border-radius: 5px;
  position: relative;
}

.nav-link:hover {
  background-color: #EADDC3;
  color: #6B80A5;
}

.nav-link i {
  margin-right: 0;
}

.nav-link.router-link-exact-active {
  background-color: #EADDC3;
  color: #6B80A5;
}

.nav-link:hover::after {
  content: attr(title);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: #EADDC3;
  color: #6B80A5;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;
  margin-left: 10px;
  z-index: 100;
}

.notification-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: red;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>