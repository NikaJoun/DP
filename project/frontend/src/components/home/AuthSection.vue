<template>
  <div class="auth-section">
    <span 
      v-if="!user" 
      class="auth-text" 
      @click="$router.push('/login')"
    >
      Авторизация
    </span>
    <span 
      v-else 
      class="auth-text" 
      @click="$router.push('/profile')"
    >
      Привет, {{ user.username }}
    </span>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/homeStore'

const homeStore = useHomeStore()
const { user } = storeToRefs(homeStore)
</script>

<style scoped>
.auth-section {
  margin-top: .5rem;
  margin-left: 1rem;
  margin-bottom: 1rem;
  text-align: left;
}

.auth-text {
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  color: #333;
}
</style>