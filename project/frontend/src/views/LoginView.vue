<template>
  <div class="main-container">
    <AuthForm
      :message="authStore.message"
      @loginUser="loginUser"
      @registerUser="registerUser"
      @loginWithTelegram="loginWithTelegram"
      @toggleForm="toggleForm"
    />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AuthForm from '@/components/auth/AuthForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const toggleForm = () => {
  authStore.message = ''
}

const registerUser = async (userData) => {
  await authStore.registerUser(userData)
  if (authStore.message.includes('успешно')) {
    setTimeout(() => router.push('/profile'), 1500)
  }
}

const loginUser = async (credentials) => {
  const success = await authStore.loginUser(credentials.phone, credentials.password)
  if (success) router.push('/profile')
}

const loginWithTelegram = async () => {
  const success = await authStore.loginWithTelegram()
  if (success) {
    setTimeout(() => router.push('/profile'), 1500)
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding: 1.5rem;
  }
}
</style>