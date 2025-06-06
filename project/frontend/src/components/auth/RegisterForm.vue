<template>
  <form @submit.prevent="submit" class="auth-form">
    <TelegramButton 
      label="Зарегистрироваться через Telegram" 
      @click="emit('loginWithTelegram')" 
    />
    <Divider />
    
    <div class="form-field">
      <label for="username" class="form-label">Имя профиля</label>
      <input 
        id="username" 
        v-model="username" 
        type="text" 
        class="form-input" 
        :class="{ 'error-input': errors.username }"
        @input="validateUsername"
      >
      <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
    </div>

    <div class="form-field">
      <label for="phone" class="form-label">Телефон</label>
      <input 
        id="phone" 
        v-model="phone" 
        type="tel" 
        class="form-input" 
        :class="{ 'error-input': errors.phone }"
        placeholder="89998887766"
        @input="validatePhone"
      >
      <div v-if="errors.phone" class="error-message">{{ errors.phone }}</div>
    </div>

    <div class="form-field">
      <label for="password" class="form-label">Пароль</label>
      <input 
        id="password" 
        v-model="password" 
        type="password" 
        class="form-input" 
        :class="{ 'error-input': errors.password }"
        @input="validatePassword"
      >
      <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
    </div>

    <div v-if="serverError" class="server-error">
      {{ serverError }}
    </div>

    <button type="submit" class="submit-btn" :disabled="isSubmitting">
      <span v-if="!isSubmitting">Зарегистрироваться</span>
    </button>
  </form>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import TelegramButton from './TelegramButton.vue'
import Divider from './AuthDivider.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const username = ref('')
const phone = ref('')
const password = ref('')
const isSubmitting = ref(false)
const serverError = ref('')
const errors = ref({
  username: '',
  phone: '',
  password: ''
})

const emit = defineEmits(['submit', 'loginWithTelegram'])

const validateUsername = () => {
  const value = username.value.trim()
  if (!value) {
    errors.value.username = 'Введите имя пользователя'
    return false
  }
  if (value.length < 3) {
    errors.value.username = 'Минимум 3 символа'
    return false
  }
  errors.value.username = ''
  return true
}

const validatePhone = () => {
  const value = phone.value.trim()
  if (!value) {
    errors.value.phone = 'Введите номер телефона'
    return false
  }
  if (!/^8\d{10}$/.test(value)) {
    errors.value.phone = 'Формат: 89998887766'
    return false
  }
  errors.value.phone = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Введите пароль'
    return false
  }
  if (password.value.length < 6) {
    errors.value.password = 'Минимум 6 символов'
    return false
  }
  errors.value.password = ''
  return true
}

const validateForm = () => {
  const isUsernameValid = validateUsername()
  const isPhoneValid = validatePhone()
  const isPasswordValid = validatePassword()
  return isUsernameValid && isPhoneValid && isPasswordValid
}

const submit = async () => {
  serverError.value = ''
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    await authStore.registerUser({ 
      username: username.value.trim(), 
      phone: phone.value.trim(), 
      password: password.value 
    })
  } catch (error) {
    serverError.value = error.message || 'Ошибка регистрации'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
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

.error-input {
  border-color: #ff4444 !important;
}

.error-message {
  color: #ff4444;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.server-error {
  color: #ff4444;
  text-align: center;
  margin: 1rem 0;
  font-size: 0.9rem;
}
</style>