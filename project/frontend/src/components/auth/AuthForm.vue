<template>
  <div class="form-container">
    <AuthTabs :isLogin="isLogin" @toggle="toggleForm" />
    
    <LoginForm 
      v-if="isLogin" 
      @submit="loginUser" 
      @loginWithTelegram="loginWithTelegram" 
    />
    
    <RegisterForm 
      v-if="!isLogin" 
      @submit="registerUser" 
      @loginWithTelegram="loginWithTelegram" 
    />
    
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

import AuthTabs from './AuthTabs.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)

const message = computed(() => authStore.message)

const toggleForm = (val) => {
  isLogin.value = val
  authStore.message = ''
}

const loginUser = async (credentials) => {
  try {
    const success = await authStore.loginUser(credentials.phone, credentials.password)
    if (success) {
      router.push('/profile')
    }
  } catch (e) {
    // сообщение из auth.js
  }
}

const registerUser = async (userData) => {
  const result = await authStore.registerUser(userData)
  if (result.success) {
    isLogin.value = true
  }
  return result
}

const loginWithTelegram = () => {
  authStore.loginWithTelegram()
}
</script>

<style scoped>
.form-container {
  background-color: #FFFFFF75;
  border-radius: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  margin: auto;
  backdrop-filter: blur(5px);
}

.auth-form {
  padding: 0.5rem;
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #212121;
  font-size: 0.95rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: white;
}

.form-input:focus {
  outline: none;
  border-color: #0088cc;
  box-shadow: 0 0 0 2px rgba(0, 136, 204, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background-color: #0088cc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  background-color: #0077b3;
}

.message {
  margin-top: 1.5rem;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  color: #d32f2f;
  background-color: rgba(211, 47, 47, 0.05);
  border: 1px solid rgba(211, 47, 47, 0.1);
}

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }
}
</style>