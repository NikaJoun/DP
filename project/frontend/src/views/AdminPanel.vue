<template>
  <div>
    <div v-if="isAdmin" class="admin-content">
      <h1>Админ Панель</h1>
      <p v-if="message" class="message">{{ message }}</p>
      
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="{ active: activeTab === tab.id }" 
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <component 
        :is="activeTabComponent" 
        @show-message="showServerMessage"
      />
      
      <div v-if="serverMessage" class="server-message" :class="{ error: messageIsError }">
        {{ serverMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import AdminUsersTab from '@/components/admin/AdminUsersTab.vue';
import AdminEventsTab from '@/components/admin/AdminEventsTab.vue';
import AdminTasksTab from '@/components/admin/AdminTasksTab.vue';
import AdminReportsTab from '@/components/admin/AdminReportsTab.vue';
import { jwtDecode } from 'jwt-decode';

export default {
  name: 'AdminPanel',
  components: {
    AdminUsersTab,
    AdminEventsTab,
    AdminTasksTab,
    AdminReportsTab
  },
  data() {
    return {
      message: '',
      isAdmin: false,
      serverMessage: '',
      messageIsError: false,
      activeTab: 'users',
      tabs: [
        { id: 'users', label: 'Пользователи' },
        { id: 'events', label: 'Мероприятия' },
        { id: 'tasks', label: 'Задания' },
        { id: 'reports', label: 'Отчеты' }
      ]
    };
  },
  computed: {
    activeTabComponent() {
      return `admin-${this.activeTab}-tab`;
    }
  },
  created() {
    this.checkAdminAccess();
  },
  methods: {
    async checkAdminAccess() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.message = 'Требуется авторизация';
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.roleId === 1) {
          this.isAdmin = true;
          this.message = 'Доступ разрешен';
        } else {
          this.message = 'Недостаточно прав';
        }
      } catch (err) {
        console.error(err);
        this.message = 'Ошибка проверки токена';
      }
    },
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    showServerMessage(message, isError = false) {
      this.serverMessage = message;
      this.messageIsError = isError;
      if (message) {
        setTimeout(() => {
          this.serverMessage = '';
        }, 5000);
      }
    }
  }
};
</script>

<style scoped>
.admin-content {
  margin: 5rem;
  padding: 25px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background-color: #ecf0f1;
  color: #34495e;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.tabs button:hover {
  background-color: #d6dbdf;
}

.tabs button.active {
  background-color: #3498db;
  color: white;
}

.server-message {
  margin-top: 20px;
  padding: 12px 15px;
  border-radius: 4px;
  background-color: #2ecc71;
  color: white;
  animation: fadeIn 0.3s ease-in-out;
}

.server-message.error {
  background-color: #e74c3c;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>