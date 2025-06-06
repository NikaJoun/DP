<template>
  <div>
    <button @click="openModal" type="button" class="tg-btn">
      <img src="@/assets/images/telegram-icon.png" alt="Telegram" class="tg-icon">
      <span>{{ label }}</span>
    </button>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Вход через Telegram</h3>
          <button class="modal-close" @click="closeModal">
            <i class="bi bi-x"></i>
          </button>
        </div>

        <div class="modal-body">
          <p v-if="error" class="error-message">{{ error }}</p>
          
          <div v-if="!codeRequested">
            <p>Нажмите кнопку ниже, чтобы получить код в Telegram:</p>
            <div class="tg-connect-area" @click="openTelegramBot">
              <i class="bi bi-send"></i>
              <p>Открыть Telegram</p>
            </div>
          </div>
          
          <div v-else>
            <p>Введите код из Telegram:</p>
            <input 
              v-model="code" 
              type="text" 
              placeholder="______"
              maxlength="6"
              class="code-input"
            />
            <div class="modal-actions">
              <button class="btn-cancel" @click="closeModal">Отмена</button>
              <button 
                class="btn-confirm" 
                @click="submitCode"
                :disabled="code.length !== 6 || submitting"
              >
                <span v-if="submitting">Проверка...</span>
                <span v-else>Продолжить</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

defineProps({
  label: String
});

const router = useRouter();
const authStore = useAuthStore();

const showModal = ref(false);
const codeRequested = ref(false);
const code = ref('');
const error = ref('');
const submitting = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  codeRequested.value = false;
  code.value = '';
  error.value = '';
  submitting.value = false;
};

const openTelegramBot = () => {
  const sessionCode = `tg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  localStorage.setItem('tg_auth_code', sessionCode);
  
  const botUrl = `https://t.me/starswriters_bot?start=${sessionCode}`;
  
  const tgWindow = window.open(botUrl, '_blank');
  if (!tgWindow || tgWindow.closed) {
    window.location.href = botUrl;
  }
  
  codeRequested.value = true;
};

const submitCode = async () => {
  if (code.value.length !== 6) return;
  
  submitting.value = true;
  error.value = '';

  try {
    const success = await authStore.verifyTelegramCode(code.value);
    if (success) {
      closeModal();
      router.push('/profile');
    } else {
      error.value = 'Неверный код. Проверьте и попробуйте снова.';
    }
  } catch (err) {
    error.value = 'Ошибка соединения. Попробуйте позже.';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.tg-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: #212121;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 1.5rem;
}

.tg-btn:hover {
  background-color: #f5f5f5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tg-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  border-radius: 15px;
}

.modal-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  color: #fff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(16px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  font-size: 0.95rem;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.tg-connect-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  margin: 1.5rem 0;
  cursor: pointer;
  transition: 0.2s;
  background: rgba(0, 136, 204, 0.1);
}

.tg-connect-area:hover {
  background: rgba(0, 136, 204, 0.2);
}

.tg-connect-area i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #0088cc;
}

.tg-connect-area p {
  margin: 0;
  font-weight: 500;
  color: #0088cc;
}

.code-input {
  width: 100%;
  padding: 1rem;
  margin: 1rem 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1.2rem;
  letter-spacing: 2px;
  text-align: center;
  font-family: monospace;
}

.code-input:focus {
  outline: none;
  border-color: #2563eb;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  transition: 0.2s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background-color: #2563eb;
  color: white;
}

.btn-confirm:hover {
  background-color: #1e40af;
}

.btn-confirm:disabled {
  background-color: #3b82f6;
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .modal-content {
    margin: 0 1rem;
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>