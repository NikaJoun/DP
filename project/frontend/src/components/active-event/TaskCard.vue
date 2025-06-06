<template>
  <div
    class="task-card"
    :class="{ 
      'released': isTaskReleased,
      'expanded': isExpanded
    }"
  >
    <div 
      class="task-summary"
      @click="$emit('toggle', task.id)"
    >
      <div class="task-number-badge">Задание {{ task.task_number }}</div>
      <div class="task-main-info">
        <h3 class="task-title">{{ task.title }}</h3>
        <div class="task-status" v-if="!isTaskReleased">
          <i class="bi bi-clock"></i>
          Доступно с {{ formatDateTime(task.release_date) }}
        </div>
      </div>
      <i 
        class="bi toggle-icon"
        :class="{
          'bi-chevron-up': isExpanded,
          'bi-chevron-down': !isExpanded
        }"
      ></i>
    </div>

    <transition name="task-expand">
      <div v-show="isExpanded" class="task-details">
        <div class="task-content">
          <div class="task-icon-container" v-if="task.icon_path">
            <img
              :src="task.icon_path"
              :alt="task.title"
              class="task-icon"
              @error="handleTaskIconError"
            />
          </div>
          <div class="task-description">
            {{ task.short_description }}
          </div>
        </div>

        <div class="task-actions" v-if="isTaskReleased">
          <div class="instructions-section">
            <h4><i class="bi bi-info-circle"></i> Инструкции</h4>
            <div class="instructions-content">
              <p v-for="(line, idx) in splitInstructions(task.instructions)" :key="idx">{{ line }}</p>
            </div>
          </div>

          <div class="action-buttons">
            <router-link 
              :to="{ 
                path: '/create-post', 
                query: { 
                  taskId: task.id,
                  eventId: task.event_id 
                } 
              }" 
              class="create-post-btn"
            >
              <i class="bi bi-pencil"></i> Создать решение
            </router-link>
            
            <button 
              class="view-posts-btn"
              @click="$emit('view-posts', task.id)"
            >
              <i class="bi bi-file-earmark-text"></i> 
              Публикации ({{ postsCount }})
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    },
    isExpanded: {
      type: Boolean,
      default: false
    },
    postsCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      defaultTaskIcon: 'https://via.placeholder.com/100/333/ffffff?text=T'
    };
  },
  computed: {
    isTaskReleased() {
      if (!this.task?.release_date) return false;
      try {
        const releaseDate = new Date(this.task.release_date);
        if (isNaN(releaseDate.getTime())) return false;
        
        return releaseDate <= new Date();
      } catch (e) {
        console.error('Ошибка проверки даты релиза:', e);
        return false;
      }
    }
  },
  methods: {
    formatDateTime(date) {
      if (!date) return 'Дата не указана';
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Неверная дата';
        
        return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru });
      } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        return 'Ошибка даты';
      }
    },
    handleTaskIconError(e) {
      e.target.src = this.defaultTaskIcon;
    },
    splitInstructions(text) {
      return text ? text.split('\n').filter(line => line.trim()) : [];
    }
  }
};
</script>

<style scoped>
.task-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
}

.task-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #dee2e6;
}

.task-card.released {
  border-left: 4px solid #4dabf7;
}

.task-card.expanded {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.task-summary {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.task-number-badge {
  background: #4dabf7;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.task-main-info {
  flex: 1;
}

.task-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 500;
  color: #333;
}

.task-status {
  font-size: 0.85rem;
  color: #868e96;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toggle-icon {
  font-size: 1.2rem;
  color: #adb5bd;
  transition: all 0.2s;
}

.task-details {
  padding: 0 1rem 1rem;
}

.task-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.task-icon-container {
  width: 60px;
  height: 60px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* overflow: hidden; */
  flex-shrink: 0;
  border: 1px solid #e9ecef;
}

.task-icon {
  max-width: 80%;
  max-height: 80%;
  object-fit: contain;
}

.task-description {
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
}

.instructions-section {
  margin-bottom: 1.5rem;
}

.instructions-section h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #333;
}

.instructions-content {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e9ecef;
  font-size: 0.9rem;
  line-height: 1.6;
}

.instructions-content p {
  margin: 0.5rem 0;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.create-post-btn {
  background: #4dabf7;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
}

.create-post-btn:hover {
  background: #339af0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.view-posts-btn {
  background: rgba(77, 171, 247, 0.1);
  color: #4dabf7;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.view-posts-btn:hover {
  background: rgba(77, 171, 247, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-expand-enter-active {
  transition: 
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1),
    max-height 0.5s ease;
}

.task-expand-leave-active {
  transition: 
    opacity 0.2s ease,
    transform 0.2s ease-out,
    max-height 0.3s ease;
}

.task-expand-enter-from,
.task-expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0 !important;
}

.task-expand-enter-to,
.task-expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 1000px;
}

@media (max-width: 768px) {
  .task-summary {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .task-title {
    font-size: 1rem;
  }
  
  .task-status {
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .create-post-btn,
  .view-posts-btn {
    width: 100%;
    justify-content: center;
  }
  
  .task-content {
    flex-direction: column;
  }
  
  .task-icon-container {
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
  }
}

@media (max-width: 480px) {
  .task-number-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }
  
  .task-title {
    font-size: 0.95rem;
  }
  
  .task-status {
    font-size: 0.75rem;
  }
  
  .toggle-icon {
    font-size: 1rem;
  }
}
</style>