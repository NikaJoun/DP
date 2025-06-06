<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Черновики</h3>
        <button class="modal-close" @click="$emit('close')">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="posts.length" class="drafts-list">
          <div 
            v-for="post in posts" 
            :key="post.id" 
            class="draft-card"
          >
            <div class="draft-info">
              <h5 class="draft-title">
                <router-link :to="'/create-post?postId=' + post.id">{{ post.title }}</router-link>
              </h5>
            </div>
            <div class="draft-actions">
              <router-link 
                :to="{ 
                  path: '/create-post', 
                  query: { 
                    postId: post.id 
                  } 
                }" 
                class="btn-action"
                title="Редактировать"
              >
                <i class="bi bi-pencil"></i>
              </router-link>
              <button 
                class="btn-action"
                title="Удалить"
                @click="$emit('delete', post.id)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">
          <i class="bi bi-journal-text"></i>
          <p>У вас нет сохранённых черновиков</p>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DraftModal',
  props: {
    posts: Array
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
  max-width: 600px;
  width: 100%;
  color: #fff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
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
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  font-size: 0.95rem;
}

.drafts-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.draft-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.draft-card:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.draft-title a {
  color: #fff;
  text-decoration: none;
  font-size: 1.1rem;
}

.draft-title a:hover {
  text-decoration: none;
  color: #a7c5f5;
}

.draft-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-action {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: 0.2s;
}

.btn-action:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  transition: 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 576px) {
  .modal-content {
    margin: 0 1rem;
    padding: 1.5rem;
  }

  .draft-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .draft-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>