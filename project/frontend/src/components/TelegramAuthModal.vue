<template>
  <div v-if="isOpen" class="telegram-auth-modal">
    <div class="modal-overlay" @click="closeModal"></div>
    
    <div class="modal-content">
      <button class="close-button" @click="closeModal">×</button>
      
      <h3>Авторизация через Telegram</h3>
      
      <div v-if="!codeSent">
        <p>Нажмите кнопку ниже, чтобы перейти в Telegram и получить код:</p>
        <button @click="openTelegramBot" class="tg-button">
          Открыть Telegram
        </button>
      </div>
      
      <div v-else>
        <p>Введите код, полученный от бота:</p>
        <input 
          v-model="code" 
          type="text" 
          placeholder="Введите код"
          class="code-input"
        />
        <button @click="submitCode" class="submit-button">
          Подтвердить
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
  },
  data() {
    return {
      code: '',
      codeSent: false,
      error: '',
    };
  },
  methods: {
    openTelegramBot() {
      const sessionCode = `tg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      localStorage.setItem('tg_auth_code', sessionCode);
      
      const botUrl = `https://t.me/starswriters_bot?start=${sessionCode}`;
      
      // Пробуем открыть в новом окне, если не получается — просто переходим по ссылке
      const tgWindow = window.open(botUrl, '_blank');
      if (!tgWindow || tgWindow.closed) {
        window.location.href = botUrl;
      }
      
      this.codeSent = true;
    },
    async submitCode() {
      if (!this.code.trim()) {
        this.error = 'Введите код';
        return;
      }
      
      try {
        await this.$emit('verify-code', this.code);
        this.$emit('close');
      } catch (err) {
        this.error = 'Неверный код. Попробуйте снова.';
      }
    },
    closeModal() {
      this.code = '';
      this.codeSent = false;
      this.error = '';
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.telegram-auth-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.tg-button {
  background: #0088cc;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.code-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.submit-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>