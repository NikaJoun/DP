<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Публикации по заданию</h3>
        <button class="modal-close" @click="$emit('close')">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading-posts">
          <i class="bi bi-arrow-repeat spin"></i> Загрузка публикаций...
        </div>
        
        <div v-else>
          <div v-if="posts.length === 0" class="empty-posts">
            <i class="bi bi-file-earmark-x"></i>
            <p>Пока нет публикаций по этому заданию</p>
          </div>
          
          <div v-else class="posts-list">
            <div 
              v-for="post in posts" 
              :key="post.id" 
              class="post-item"
              @click="goToPost(post.id)"
            >
              <div class="post-header">
                <h4 class="post-title">{{ post.title }}</h4>
                <div class="post-rating">
                  <i class="bi bi-star-fill"></i> {{ post.rating }}
                </div>
              </div>
              <div class="post-author">
                <i class="bi bi-person"></i> {{ post.username }}
              </div>
              <div class="post-meta">
                <span><i class="bi bi-eye"></i> {{ post.views }}</span>
                <span><i class="bi bi-chat-left"></i> {{ post.comments_count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PostsModal',
  props: {
    taskId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      loading: false,
      posts: []
    };
  },
  watch: {
    taskId: {
      immediate: true,
      async handler(newVal) {
        if (newVal) {
          await this.loadPosts();
        }
      }
    }
  },
  methods: {
    async loadPosts() {
      this.loading = true;
      this.posts = [];
      
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        const response = await axios.get(`/api/posts/task/${this.taskId}`, config);
        this.posts = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error);
        this.posts = [];
      } finally {
        this.loading = false;
      }
    },
    goToPost(postId) {
      this.$router.push({ name: 'PostPage', params: { id: postId } });
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  color: #868e96;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.post-item:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.post-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.post-rating {
  background: #fff3bf;
  color: #5f3dc4;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-author {
  font-size: 0.85rem;
  color: #868e96;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.post-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #adb5bd;
}

.post-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.loading-posts,
.empty-posts {
  text-align: center;
  padding: 2rem;
  color: #868e96;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-posts i {
  font-size: 1.5rem;
  color: #adb5bd;
}

.empty-posts i {
  font-size: 2rem;
  color: #dee2e6;
}

.empty-posts p {
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
</style>