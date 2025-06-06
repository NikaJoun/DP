<template>
  <div class="task-form-modal" v-if="isVisible">
    <div class="modal-content">
      <h3>{{ isEditing ? 'Редактировать задание' : 'Добавить задание' }}</h3>
      <button class="close-btn" @click="closeModal">&times;</button>

      <form @submit.prevent="submitTask">
        <div class="form-group">
          <label>Номер задания:</label>
          <input 
            type="number" 
            v-model="form.task_number" 
            required 
            min="1" 
          />
        </div>

        <div class="form-group">
          <label>Название:</label>
          <input 
            type="text" 
            v-model="form.title" 
            required 
          />
        </div>

        <div class="form-group">
          <label>Краткое описание:</label>
          <textarea 
            v-model="form.short_description" 
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Инструкции:</label>
          <textarea 
            v-model="form.instructions" 
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label>Дата выхода:</label>
          <input 
            type="date"
            v-model="form.releaseDate" 
            :min="eventStartDate" 
            :max="eventEndDate"
            required 
          />
          <small v-if="event">
            Должна быть между {{ formatDate(event.start_date) }} и {{ formatDate(event.end_date) }}
          </small>
          <div v-if="dateError" class="error-message">{{ dateError }}</div>
        </div>

        <div class="form-group">
          <label>Иконка:</label>
          <div v-if="isEditing && currentIcon" class="current-icon">
            <p>Текущая иконка:</p>
            <img 
              :src="currentIcon" 
              alt="Текущая иконка задания" 
              class="icon-preview" 
            />
          </div>
          <input 
            type="file" 
            @change="handleIconUpload" 
            :required="!isEditing" 
            accept="image/*" 
          />
          <small v-if="isEditing">Оставьте пустым, чтобы сохранить текущую иконку</small>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            @click="closeModal" 
            class="cancel-btn"
          >
            Отмена
          </button>
          <button 
            type="submit" 
            class="submit-btn"
          >
            {{ isEditing ? 'Сохранить' : 'Создать' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskForm',
  props: {
    task: {
      type: Object,
      default: () => ({})
    },
    isEditing: Boolean,
    eventId: {
      type: Number,
      required: true
    },
    event: {
      type: Object,
      required: true
    },
    isVisible: Boolean
  },
  data() {
    return {
      form: {
        task_number: '',
        title: '',
        short_description: '',
        instructions: '',
        releaseDate: ''
      },
      iconFile: null,
      currentIcon: '',
      dateError: ''
    };
  },
  computed: {
    eventStartDate() {
      return this.event ? this.formatDateTimeLocal(new Date(this.event.start_date)) : '';
    },
    eventEndDate() {
      return this.event ? this.formatDateTimeLocal(new Date(this.event.end_date)) : '';
    }
  },
  watch: {
    isEditing: {
      immediate: true,
      handler(newVal) {
        if (newVal && this.task) {
          this.form = {
            task_number: this.task.task_number,
            title: this.task.title,
            short_description: this.task.short_description,
            instructions: this.task.instructions,
            releaseDate: this.formatDateTimeLocal(new Date(this.task.release_date))
          };
          this.currentIcon = this.task.icon_path || '';
        } else {
          this.resetForm();
        }
      }
    }
  },
  methods: {
    formatDateTimeLocal(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    handleIconUpload(event) {
      this.iconFile = event.target.files[0];
      if (event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentIcon = e.target.result;
        };
        reader.readAsDataURL(event.target.files[0]);
      }
    },
    validateDates() {
      this.dateError = '';
      
      if (!this.form.releaseDate) {
        return true;
      }

      const releaseDate = new Date(this.form.releaseDate);
      const eventStart = new Date(this.event.start_date);
      const eventEnd = new Date(this.event.end_date);

      if (releaseDate < eventStart.setHours(0, 0, 0, 0) || 
          releaseDate > eventEnd.setHours(23, 59, 59, 999)) {
        this.dateError = 'Дата релиза должна быть в пределах дат мероприятия';
        return false;
      }

      return true;
    },
    submitTask() {
      if (!this.validateDates()) {
        return;
      }

      if (!this.form.task_number || !this.form.title || 
          !this.form.short_description || !this.form.instructions || !this.form.releaseDate) {
        this.dateError = 'Все поля обязательны для заполнения';
        return;
      }

      const formData = new FormData();
      formData.append('task_number', this.form.task_number);
      formData.append('title', this.form.title);
      formData.append('short_description', this.form.short_description);
      formData.append('instructions', this.form.instructions);
      
      try {
        const releaseDate = new Date(this.form.releaseDate);
        const formattedDate = releaseDate.toISOString().split('T')[0];
        formData.append('release_date', formattedDate);

        if (this.iconFile) {
          formData.append('icon', this.iconFile);
        }

        this.$emit('taskSaved', {
          formData,
          eventId: this.eventId,
          isEditing: this.isEditing,
          taskId: this.isEditing ? this.task.id : null
        });
        
      } catch (error) {
        console.error('Ошибка при формировании данных:', error);
        this.$emit('error', 'Ошибка при формировании данных задания');
      }
    },
    closeModal() {
      this.$emit('cancel');
      this.resetForm();
    },
    resetForm() {
      this.form = {
        task_number: '',
        title: '',
        short_description: '',
        instructions: '',
        releaseDate: ''
      };
      this.iconFile = null;
      this.currentIcon = '';
      this.dateError = '';
    }
  }
};
</script>

<style scoped>
.task-form-modal {
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
  background-color: white;
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

h3 {
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
  min-height: 80px;
  resize: vertical;
}

.error-message {
  color: #e74c3c;
  font-size: 0.9em;
  margin-top: 5px;
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

.current-icon {
  margin: 10px 0;
}

.icon-preview {
  max-width: 100px;
  max-height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 20px;
  }
}
</style>