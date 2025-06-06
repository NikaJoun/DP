<template>
  <div class="sidebar-content">
    <div class="user-card">
      <div class="avatar-container">
        <img 
          :src="userAvatar" 
          alt="Аватар"
          class="user-avatar"
        >
        <button class="avatar-edit-btn" @click="$emit('edit-avatar')">
          <i class="bi bi-camera"></i>
        </button>
      </div>
      <h3 class="username">{{ user?.username || 'Пользователь' }}</h3>
      <div class="user-stats">
        <a href="#" @click.prevent="$emit('open-followers')" class="stat-item">
          <i class="bi bi-people"></i> {{ followersCount }} подписчиков
        </a>
        <a href="#" @click.prevent="$emit('open-subscriptions')" class="stat-item">
          <i class="bi bi-person-plus"></i> {{ subscriptionsCount }} подписок
        </a>
      </div>
    </div>

    <nav class="menu">
      <router-link to="/create-post" class="menu-item">
        <i class="bi bi-pencil-square"></i> Написать текст
      </router-link>
      <button class="menu-item" @click="$emit('open-drafts')">
        <i class="bi bi-files"></i> Черновики
      </button>
      <button class="menu-item" @click="$emit('open-edit-profile')">
        <i class="bi bi-gear"></i> Редактировать профиль
      </button>
      <button class="menu-item logout" @click="$emit('logout')">
        <i class="bi bi-box-arrow-right"></i> Выход
      </button>
    </nav>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { computed } from 'vue'

const props = defineProps({
  user: Object,
  followersCount: {
    type: Number,
    default: 0
  },
  subscriptionsCount: {
    type: Number,
    default: 0
  }
})

const userAvatar = computed(() => {
  return props.user?.avatar || '/default-avatar.png'
})

defineEmits([
  'edit-avatar',
  'open-followers',
  'open-subscriptions',
  'logout',
  'open-drafts',
  'open-edit-profile'
])
</script>

<style scoped>
.sidebar-content {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.user-card {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.avatar-edit-btn:hover {
  background-color: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.username {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #fff;
}

.user-stats {
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.stat-item {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  text-decoration: none;
  transition: color 0.2s;
}

.stat-item:hover {
  color: #fff;
}

.stat-item i {
  font-size: 1rem;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  padding: 0.8rem 1rem;
  border-radius: 6px;
  text-align: left;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu-item:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item i {
  font-size: 1.1rem;
}

.menu-item.logout {
  color: rgba(255, 100, 100, 0.8);
  margin-top: 1rem;
}

.menu-item.logout:hover {
  color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
}
</style>