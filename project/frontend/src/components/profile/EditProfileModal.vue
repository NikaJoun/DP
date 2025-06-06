<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Редактировать профиль</h2>
        <button class="modal-close" @click="$emit('close')">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <form @submit.prevent="submitEditProfile" class="modal-body">
        <div class="form-group">
          <label for="username">Имя пользователя</label>
          <input 
            type="text" 
            id="username" 
            v-model="editableUser.username" 
            :class="{ 'error': errors.username }"
            @input="validateField('username')"
          />
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>
        <div class="form-group">
          <label for="phone">Телефон</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="editableUser.phone" 
            :class="{ 'error': errors.phone }"
            @input="validateField('phone')"
          />
          <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
        </div>
        <div class="form-group">
          <label for="about">О себе</label>
          <textarea 
            id="about" 
            v-model="editableUser.about" 
            rows="4" 
            maxlength="1000"
          />
          <span class="char-counter">{{ editableUser.about?.length || 0 }}/1000</span>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">Сохранение...</span>
            <span v-else>Сохранить</span>
          </button>
          <button type="button" class="btn" @click="$emit('close')">Отмена</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EditProfileModal',
  props: {
    user: Object
  },
  data() {
    return {
      editableUser: { ...this.user },
      errors: {
        username: '',
        phone: ''
      },
      isSubmitting: false
    };
  },
  methods: {
    validateField(field) {
      if (field === 'username') {
        if (!this.editableUser.username) {
          this.errors.username = 'Имя пользователя обязательно';
        } else if (this.editableUser.username.length > 255) {
          this.errors.username = 'Имя не должно превышать 255 символов';
        } else {
          this.errors.username = '';
        }
      } else if (field === 'phone') {
        const phoneRegex = /^8\d{10}$/;
        if (!this.editableUser.phone) {
          this.errors.phone = 'Телефон обязателен';
        } else if (!phoneRegex.test(this.editableUser.phone)) {
          this.errors.phone = 'Формат: 89997776655 (11 цифр)';
        } else {
          this.errors.phone = '';
        }
      }
    },
    validateForm() {
      this.validateField('username');
      this.validateField('phone');
      return !this.errors.username && !this.errors.phone;
    },
    async submitEditProfile() {
      if (!this.validateForm()) return;
      
      this.isSubmitting = true;
      try {
        await this.$emit('update', this.editableUser);
        this.$emit('close');
      } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
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

.modal-header h2 {
  font-size: 1.25rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  font-size: 0.95rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #bbb;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.8rem;
  border: 1px solid #444;
  border-radius: 10px;
  background-color: #3b3f4b;
  color: #fff;
  outline: none;
  transition: border 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #66afe9;
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ff4d4f;
}

.error-message {
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 0.3rem;
}

.char-counter {
  font-size: 0.8rem;
  color: #aaa;
  text-align: right;
  margin-top: 0.3rem;
}

/* Кнопки */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background-color: #444;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn.primary {
  background-color: #3b82f6;
}

.btn.primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn.primary:disabled {
  background-color: #1e4b8f;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn:hover {
  background-color: #555;
}

@media (max-width: 576px) {
  .modal-content {
    margin: 0 1rem;
    padding: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>