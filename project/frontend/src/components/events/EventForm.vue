<template>
  <div class="event-form-modal" v-if="isVisible">
    <div class="modal-content">
      <h2>{{ isEditing ? 'Редактировать мероприятие' : 'Создать мероприятие' }}</h2>
      <button class="close-btn" @click="closeModal">&times;</button>

      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Название:</label>
          <input v-model="formData.title" type="text" required />
        </div>

        <div class="form-group">
          <label>Описание:</label>
          <textarea v-model="formData.description" required></textarea>
        </div>

        <div class="date-inputs">
          <div class="form-group">
            <label>Дата начала:</label>
            <input
              v-model="formData.startDate"
              type="date"
              :min="today"
              required
              @change="validateDates"
            />
          </div>
          <div class="form-group">
            <label>Дата окончания:</label>
            <input
              v-model="formData.endDate"
              type="date"
              :min="formData.startDate || today"
              required
              @change="validateDates"
            />
          </div>
        </div>
        <div v-if="dateError" class="error-message">{{ dateError }}</div>

        <div class="form-group">
          <label>Изображение:</label>
          <div v-if="isEditing && currentImage" class="current-image">
            <p>Текущее изображение:</p>
            <img
              :src="currentImage"
              alt="Текущее изображение мероприятия"
              class="image-preview"
              @error="handleImageError"
            />
          </div>
          <input
            type="file"
            @change="handleImageUpload"
            :required="!isEditing"
            accept="image/*"
          />
          <small v-if="isEditing">Оставьте пустым, чтобы сохранить текущее изображение</small>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="cancel-btn">Отмена</button>
          <button type="submit" class="submit-btn">{{ isEditing ? 'Обновить' : 'Создать' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: {
      type: Object,
      default: null
    },
    isVisible: Boolean,
    existingEvents: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      formData: {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        image: null
      },
      currentImage: '',
      isEditing: false,
      dateError: ''
    };
  },
  computed: {
    today() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  watch: {
    event: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.isEditing = true;
          const startDate = new Date(newVal.start_date);
          const endDate = new Date(newVal.end_date);
          
          const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          };
          
          this.formData = {
            title: newVal.title,
            description: newVal.description,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            image: null
          };
          this.currentImage = newVal.image_path || '';
        } else {
          this.resetForm();
        }
      }
    }
  },
  methods: {
    parseFromInput(dateString) {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-');
      return `${year}-${month}-${day}`;
    },
    formatDateTimeLocal(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    handleImageUpload(event) {
      this.formData.image = event.target.files[0];
      if (event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentImage = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    },
    validateDates() {
      this.dateError = '';
      
      if (!this.formData.startDate || !this.formData.endDate) {
        return true;
      }

      const startDate = new Date(this.formData.startDate);
      const endDate = new Date(this.formData.endDate);

      if (endDate < startDate) {
        this.dateError = 'Дата окончания не может быть раньше даты начала';
        return false;
      }
      return true;
    },
    submitForm() {
      if (!this.formData.title || !this.formData.description || 
          !this.formData.startDate || !this.formData.endDate) {
        this.dateError = 'Все поля обязательны для заполнения';
        return;
      }

      if (!this.validateDates()) {
        return;
      }

      const formData = new FormData();
      formData.append('title', this.formData.title);
      formData.append('description', this.formData.description);
      formData.append('startDate', this.formData.startDate);
      formData.append('endDate', this.formData.endDate);

      if (this.formData.image) {
        formData.append('image', this.formData.image);
      }

      this.$emit('submit', formData);
    },
    closeModal() {
      this.$emit('cancel');
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        image: null
      };
      this.currentImage = '';
      this.isEditing = false;
      this.dateError = '';
    },
    handleImageError() {
      this.currentImage = '';
    }
  }
};
</script>

<style scoped>
.event-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #7f8c8d;
}

.close-btn:hover {
  color: #e74c3c;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  font-size: 16px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9em;
  margin-bottom: 15px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.submit-btn:hover {
  background-color: #27ae60;
}

.cancel-btn {
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #c0392b;
}

small {
  color: #7f8c8d;
  font-size: 0.8em;
  display: block;
  margin-top: 5px;
}

.current-image {
  margin: 10px 0;
}

.image-preview {
  max-width: 100%;
  max-height: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .date-inputs {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    padding: 20px;
  }
}
</style>