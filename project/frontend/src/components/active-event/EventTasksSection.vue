<template>
  <div class="tasks-section">
    <div class="section-header">
      <h2><i class="bi bi-list-task"></i> Задания события</h2>
      <div class="tasks-count">{{ event.tasks?.length || 0 }} заданий</div>
    </div>

    <div v-if="loading" class="loading-tasks">
      <i class="bi bi-arrow-repeat spin"></i> Загрузка заданий...
    </div>

    <div v-else-if="!event.tasks?.length" class="empty-tasks">
      <i class="bi bi-list-check"></i>
      <p>Для этого события пока нет заданий</p>
    </div>

    <div v-else class="tasks-list">
      <TaskCard
        v-for="task in event.tasks"
        :key="task.id"
        :task="task"
        :is-expanded="expandedTaskId === task.id"
        :posts-count="getPostsCount(task.id)"
        @toggle="handleTaskClick"
        @view-posts="openPostsModal"
      />
    </div>

    <PostsModal
      v-if="showPostsModal"
      :task-id="currentTaskId"
      @close="closePostsModal"
    />
  </div>
</template>

<script>
import axios from 'axios';
import TaskCard from './TaskCard.vue';
import PostsModal from './PostsModal.vue';

export default {
  name: 'EventTasksSection',
  components: {
    TaskCard,
    PostsModal
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    initialTaskId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      expandedTaskId: this.initialTaskId,
      isAnimating: false,
      showPostsModal: false,
      currentTaskId: null,
      taskPostsCount: {},
    };
  },
    watch: {
    initialTaskId(newVal) {
      if (newVal) {
        this.expandedTaskId = newVal;
        if (!this.taskPostsCount[newVal]) {
          this.fetchPostsCount(newVal);
        }
      }
    }
  },
  methods: {
    async fetchPostsCount(taskId) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(`/api/posts/task/${taskId}`, config);
        this.taskPostsCount = {
          ...this.taskPostsCount,
          [taskId]: response.data.length
        };
      } catch (error) {
        console.error('Ошибка при загрузке количества публикаций:', error);
        this.taskPostsCount = {
          ...this.taskPostsCount,
          [taskId]: 0
        };
      }
    },
    getPostsCount(taskId) {
      return this.taskPostsCount[taskId] || 0;
    },
    handleTaskClick(taskId) {
      if (this.isAnimating) return;
      
      if (this.expandedTaskId === taskId) {
        this.expandedTaskId = null;
        return;
      }
      
      if (this.expandedTaskId) {
        this.isAnimating = true;
        this.expandedTaskId = null;
        
        setTimeout(() => {
          this.expandedTaskId = taskId;
          this.isAnimating = false;
        }, 300);
      } else {
        this.expandedTaskId = taskId;
      }
      
      if (!this.taskPostsCount[taskId]) {
        this.fetchPostsCount(taskId);
      }
    },
    openPostsModal(taskId) {
      this.showPostsModal = true;
      this.currentTaskId = taskId;
    },
    closePostsModal() {
      this.showPostsModal = false;
      this.currentTaskId = null;
    }
  }
};
</script>

<style scoped>
.tasks-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.tasks-count {
  background: #f1f3f5;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #555;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.loading-tasks, 
.empty-tasks {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-tasks i {
  font-size: 1.5rem;
  color: #adb5bd;
}

.empty-tasks i {
  font-size: 2rem;
  color: #dee2e6;
}

.empty-tasks p {
  margin: 0.5rem 0 0;
  color: #868e96;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 991px) {
  .section-header h2 {
    font-size: 1.2rem;
  }
}

@media (max-width: 768px) {
  .tasks-section {
    padding: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .tasks-count {
    margin-left: 0;
  }
}
</style>