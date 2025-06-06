<template>
  <div>
    <h2>Управление заданиями</h2>
    <div class="task-controls">
      <div class="event-selector">
        <label for="eventSelect">Выберите мероприятие:</label>
        <select v-model="selectedEventId" id="eventSelect" @change="fetchTasksForEvent">
          <option disabled value="">-- Выберите мероприятие --</option>
          <option v-for="event in events" :key="event.id" :value="event.id">
            {{ event.title }}
          </option>
        </select>
      </div>

      <button @click="openTaskForm" class="add-task-btn">+ Добавить задание</button>
    </div>

    <div v-if="selectedEventId">
    <TaskForm
      v-if="isTaskFormVisible"
      :task="selectedTask"
      :isEditing="isEditingTask"
      :eventId="selectedEventId"
      :event="selectedEvent"
      :isVisible="isTaskFormVisible"
      @taskSaved="onTaskSaved"
      @cancel="isTaskFormVisible = false"
      @error="showError"
    />

      <div v-if="isLoading" class="loading-indicator">
        Загрузка заданий...
      </div>

      <div v-else>
        <div v-if="tasks.length" class="tasks-container">
          <div v-for="task in tasks" :key="task.id" class="task-card">
            <div class="task-main">
              <span class="task-number">Задание #{{ task.task_number }}</span>
              <h3 class="task-title">{{ task.title }}</h3>
              <p class="task-description">{{ task.short_description }}</p>
              <div class="task-meta">
                <span class="task-date">Доступно с: {{ formatTaskDate(task.release_date) }}</span>
              </div>
            </div>
            <div class="task-actions">
              <button 
                @click.stop="editTask(task)" 
                class="edit-btn"
                :disabled="isTaskReleased(task)"
              >
                Редактировать
              </button>
              <button 
                @click.stop="deleteTask(task.id)" 
                class="delete-btn"
                :disabled="isTaskReleased(task)"
              >
                Удалить
              </button>
              <span 
                v-if="isTaskReleased(task)" 
                class="edit-disabled-tooltip"
              >
                Редактирование запрещено, задание уже выпущено
              </span>
            </div>
          </div>
        </div>
        <p v-else class="no-tasks">Нет заданий для выбранного мероприятия</p>
      </div>
    </div>
    <p v-else class="select-event-prompt">Пожалуйста, выберите мероприятие для просмотра заданий</p>
  </div>
</template>

<script>
import axios from 'axios';
import TaskForm from '@/components/events/TaskForm.vue';

export default {
  name: 'AdminTasksTab',
  components: {
    TaskForm
  },
  data() {
    return {
      events: [],
      tasks: [],
      selectedEventId: null,
      isTaskFormVisible: false,
      isEditingTask: false,
      selectedTask: {},
      isLoading: false
    };
  },
  created() {
    this.fetchEvents();
  },
  methods: {
    async fetchEvents() {
      try {
        const res = await axios.get('/api/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.events = res.data;
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка получения мероприятий', true);
      }
    },
     async fetchTasksForEvent() {
      if (!this.selectedEventId) return;
      
      this.isLoading = true;
      try {
        const eventRes = await axios.get(`/api/events/${this.selectedEventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.selectedEvent = eventRes.data;
        
        const tasksRes = await axios.get(`/api/events/${this.selectedEventId}/tasks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.tasks = tasksRes.data;
        this.$emit('show-message', '');
      } catch (err) {
        console.error(err);
        this.tasks = [];
        this.$emit('show-message', err.response?.data?.message || 'Ошибка загрузки заданий', true);
      } finally {
        this.isLoading = false;
      }
    },
    openTaskForm() {
      this.selectedTask = {};
      this.isEditingTask = false;
      this.isTaskFormVisible = true;
    },
    editTask(task) {
      this.selectedTask = { ...task };
      this.isEditingTask = true;
      this.isTaskFormVisible = true;
    },
    isTaskReleased(task) {
      return new Date(task.release_date) <= new Date();
    },
    async onTaskSaved({ formData, eventId, isEditing, taskId }) {
      try {
        const url = isEditing 
          ? `/api/events/${eventId}/tasks/${taskId}`
          : `/api/events/${eventId}/tasks`;
        
        const method = isEditing ? 'put' : 'post';
        
        await axios[method](url, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.isTaskFormVisible = false;
        await this.fetchTasksForEvent();
        this.$emit('show-message', 
          isEditing 
            ? 'Задание успешно обновлено' 
            : 'Задание успешно создано'
        );
        
      } catch (error) {
        console.error('Ошибка при сохранении задания:', error);
        this.$emit('show-message',
          error.response?.data?.message || 'Произошла ошибка при сохранении задания', 
          true
        );
      }
    },
    showError(message) {
      this.$emit('show-message', message, true);
    },
    async deleteTask(taskId) {
      if (!confirm('Вы уверены, что хотите удалить это задание? Это действие нельзя отменить.')) return;
      
      try {
        await axios.delete(`/api/events/${this.selectedEventId}/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.$emit('show-message', 'Задание успешно удалено');
        this.fetchTasksForEvent();
      } catch (err) {
        console.error(err);
        this.$emit('show-message', err.response?.data?.message || 'Ошибка при удалении задания', true);
      }
    },
    formatTaskDate(dateString) {
      if (!dateString) return 'Не указана';
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
  }
};
</script>

<style scoped>
.task-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
  padding: 0 10px;
}

.event-selector {
  flex: 1;
  min-width: 250px;
}

.event-selector label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #2c3e50;
}

.event-selector select {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: #fff;
  transition: border-color 0.2s;
}

.event-selector select:focus {
  border-color: #3498db;
  outline: none;
}

.add-task-btn {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  height: 40px;
}

.add-task-btn:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.add-task-btn:active {
  transform: translateY(0);
}

.tasks-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  padding: 10px;
}

.task-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.task-main {
  margin-bottom: 15px;
}

.task-number {
  display: inline-block;
  background: #f1c40f;
  color: #34495e;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.75em;
  font-weight: bold;
  margin-bottom: 12px;
}

.task-title {
  margin: 10px 0;
  color: #2c3e50;
  font-size: 1.1em;
}

.task-description {
  color: #7f8c8d;
  font-size: 0.9em;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* overflow: hidden; */
}

.task-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #95a5a6;
  margin-top: 15px;
}

.task-date {
  color: #3498db;
  font-weight: 500;
}

.task-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 10px;
}

.edit-btn, .delete-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.85em;
  flex: 1;
  min-width: calc(50% - 5px);
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.edit-btn:hover:not(:disabled), 
.delete-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.edit-btn:disabled,
.delete-btn:disabled {
  background-color: #f5f5f5;
  color: #bdc3c7;
  cursor: not-allowed;
  border: 1px solid #e0e0e0;
  transform: none;
}

.edit-disabled-tooltip {
  display: block;
  width: 100%;
  font-size: 0.75em;
  color: #e74c3c;
  padding: 8px;
  background-color: #fdeded;
  border-radius: 4px;
  margin-top: 5px;
  text-align: center;
  line-height: 1.4;
}

.loading-indicator {
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
}

.no-tasks, .select-event-prompt {
  text-align: center;
  padding: 30px;
  color: #95a5a6;
  font-style: italic;
  background: #f9f9f9;
  border-radius: 8px;
  margin: 20px;
}

@media (max-width: 768px) {
  .task-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-task-btn {
    width: 100%;
  }
  
  .tasks-container {
    grid-template-columns: 1fr;
  }
  
  .edit-btn, .delete-btn {
    min-width: 100%;
  }
}
</style>