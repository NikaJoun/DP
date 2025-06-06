<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h5>{{ title }}</h5>
        <button type="button" class="close-btn" @click="close">
          &times;
        </button>
      </div>
      <div class="modal-body">
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
        </div>
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        <div v-else-if="items.length === 0" class="text-center">
          <p>Список пуст</p>
        </div>
        <ul v-else class="list-group">
          <li v-for="item in items" :key="item.id" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <div class="avatar me-3">
                  <img v-if="item.avatar" :src="item.avatar" class="avatar-img rounded-circle">
                  <i v-else class="bi bi-person-circle fs-4"></i>
                </div>
                <div class="text-truncate" style="max-width: 200px;">
                  <h6 class="mb-0 text-truncate">{{ item.username }}</h6>
                  <small class="text-muted text-truncate d-block">{{ item.about || 'Нет информации' }}</small>
                </div>
              </div>
              <router-link 
                :to="'/user/' + item.id" 
                class="btn btn-sm btn-primary profile-btn"
                @click="handleProfileClick"
              >
                Профиль
              </router-link>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SubscriptionsModal',
  props: {
    title: {
      type: String,
      required: true
    },
    fetchUrl: {
      type: String,
      required: true
    },
    requiresAuth: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      items: [],
      loading: true,
      error: null
    };
  },
  async mounted() {
    await this.fetchItems();
  },
  methods: {
    async fetchItems() {
      try {
        this.loading = true;
        this.error = null;
        
        const config = {};
        const token = localStorage.getItem('token');
        
        if (this.requiresAuth && !token) {
          this.error = 'Для просмотра требуется авторизация';
          return;
        }
        
        if (token) {
          config.headers = { Authorization: `Bearer ${token}` };
        }
        
        const response = await axios.get(this.fetchUrl, config);
        this.items = response.data;
      } catch (error) {
        this.error = this.getErrorMessage(error);
      } finally {
        this.loading = false;
      }
    },
    getErrorMessage(error) {
      if (error.response) {
        return error.response.data?.error || 'Ошибка сервера';
      }
      return error.message || 'Не удалось загрузить данные';
    },
    handleProfileClick() {
      this.close();
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  /* overflow: hidden; */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h5 {
  margin: 0;
  font-weight: 600;
}

.modal-body {
  padding: 1rem;
  overflow-y: auto;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  color: #6c757d;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #495057;
}

.avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-truncate {
  /* overflow: hidden; */
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-btn {
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: none;
}

.profile-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #0b5ed7;
}

.list-group-item {
  border-left: none;
  border-right: none;
  padding: 0.75rem 1rem;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>