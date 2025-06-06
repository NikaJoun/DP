<template>
  <div class="user-card">
    <div class="avatar-container">
      <img :src="userAvatar" alt="Аватар" class="user-avatar">
    </div>
    
    <h3 class="username">{{ user?.username || 'Пользователь' }}</h3>
    <p class="join-date">На сайте с {{ formattedJoinDate }}</p>
    
    <div class="user-stats">
      <a href="#" @click.prevent="$emit('open-followers')" class="stat-item">
        <i class="bi bi-people"></i> {{ followersCount }} подписчиков
      </a>
      <a href="#" @click.prevent="$emit('open-subscriptions')" class="stat-item">
        <i class="bi bi-person-plus"></i> {{ subscriptionsCount }} подписок
      </a>
    </div>
    
    <button 
      v-if="!isOwnProfile"
      @click="handleSubscription"
      :class="{ 'subscribed': isSubscribed }"
      class="subscribe-btn"
      :disabled="loading"
    >
      <span v-if="loading">Загрузка...</span>
      <span v-else>{{ isSubscribed ? 'Отписаться' : 'Подписаться' }}</span>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

const props = defineProps({
  user: Object,
  followersCount: Number,
  subscriptionsCount: Number,
  isSubscribed: Boolean,
  isOwnProfile: Boolean,
  formattedJoinDate: String
});

const emit = defineEmits(['toggle-subscribe', 'open-followers', 'open-subscriptions']);
const loading = ref(false);

const userAvatar = computed(() => {
  return props.user?.avatar || '/default-avatar.png';
});

const handleSubscription = async () => {
  loading.value = true;
  try {
    emit('toggle-subscribe', props.user.id);
  } catch (error) {
    console.error('Ошибка подписки:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.user-card {
  text-align: center;
  margin-bottom: 2rem;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
}

.avatar-container {
  margin-bottom: 1rem;
}

.user-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.username {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #fff;
}

.join-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.user-stats {
  margin: 1.5rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.stat-item {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
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

.subscribe-btn {
  width: 100%;
  padding: 0.8rem;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.subscribe-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.subscribe-btn.subscribed {
  background-color: rgba(255, 100, 100, 0.2);
  color: #ff6b6b;
}

.subscribe-btn.subscribed:hover {
  background-color: rgba(255, 100, 100, 0.3);
}

@media (max-width: 576px) {
  .user-avatar {
    width: 120px;
    height: 120px;
  }
}
</style>