<template>
  <div class="page">
    <div v-if="isLoading" class="loader">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <article v-if="post" class="post">
        <header class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <router-link :to="'/user/' + post.user_id" class="author-link">@{{ post.username }}</router-link>
            <span class="rating" :class="ratingClass">{{ postRating.toFixed(1) }}/5</span>
          </div>
        </header>

        <div class="post-content" v-html="post.content"></div>
      </article>

      <section v-if="isAuthenticated" class="comment-form">
        <form @submit.prevent="submitComment">
          <div class="form-title">
            <h3 class="comment-form-title">Ваш комментарий</h3>
            <div class="stars">
              <span 
                v-for="n in 5" 
                :key="n" 
                :class="['star', n <= newComment.rating ? 'filled' : '']" 
                @click="newComment.rating = n"
              >★</span>
            </div>
          </div>
          <div class="form-flex">
            <div class="form-group">
              <textarea 
                v-model="newComment.liked" 
                class="form-textarea" 
                placeholder="Расскажите, что вам понравилось"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <textarea 
                v-model="newComment.disliked" 
                class="form-textarea" 
                placeholder="Расскажите, что вам не понравилось"
                rows="4"
              ></textarea>
            </div>
            <div class="form-group">
              <textarea 
                v-model="newComment.overall_impression" 
                class="form-textarea" 
                placeholder="Расскажите ваши впечатления"
                rows="4"
              ></textarea>
            </div>
          </div>
          <div class="submit-wrapper">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? 'Публикация...' : 'Опубликовать' }}
            </button>
          </div>
        </form>
      </section>

      <section v-else class="comment-form">
        <div class="auth-message">
          <p>Чтобы оставить комментарий, пожалуйста, <router-link to="/login">войдите</router-link> или <router-link to="/login">зарегистрируйтесь</router-link>.</p>
        </div>
      </section>

      <section v-if="comments?.length" class="comments">
        <div v-for="comment in filteredComments" :key="comment.id" class="comment">
          <div class="comment-header">
            <router-link :to="'/user/' + comment.user_id" class="user-link">@{{ comment.username }}</router-link>
            <span class="date">{{ formatDate(comment.created_at) }}</span>
            <span class="stars">
              <span v-for="n in 5" :key="n" :class="['star', n <= comment.rating ? 'filled' : '']">★</span>
            </span>
          </div>

          <div class="comment-content">
            <p><strong>Понравилось:</strong> {{ comment.liked }}</p>
            <p><strong>Не понравилось:</strong> {{ comment.disliked }}</p>
            <p><strong>Впечатления:</strong> {{ comment.overall_impression }}</p>
          </div>
        </div>
      </section>

      <div v-if="error" class="error">
        Ошибка: {{ error }}
      </div>
    </template>
  </div>
</template>

<script>
import { usePostDetailStore } from '@/stores/postDetailStore'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const postStore = usePostDetailStore()
    const authStore = useAuthStore()
    const { post, comments, error, isLoading, postRating, ratingClass } = storeToRefs(postStore)
    const { isAuthenticated } = storeToRefs(authStore)
    const route = useRoute()
    const isSubmitting = ref(false)
    const newComment = ref({
      liked: '',
      disliked: '',
      overall_impression: '',
      rating: 5
    })

    const fetchData = async () => {
      const postId = route.params.id
      await postStore.fetchPost(postId)
      await postStore.fetchComments(postId)
    }

    const filteredComments = computed(() => {
      return (comments.value || [])
        .filter(comment => comment?.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })

    const submitComment = async () => {
      isSubmitting.value = true
      try {
        const postId = route.params.id
        await postStore.submitComment(postId, newComment.value)
        await postStore.fetchComments(postId)
        newComment.value = { liked: '', disliked: '', overall_impression: '', rating: 5 }
      } catch (error) {
        console.error('Ошибка при отправке комментария:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const formatDate = (isoString) => {
      const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      return new Date(isoString).toLocaleString('ru-RU', options)
    }

    return {
      postStore,
      post,
      comments,
      error,
      isLoading,
      postRating,
      ratingClass,
      newComment,
      isSubmitting,
      isAuthenticated,
      fetchData,
      submitComment,
      filteredComments,
      formatDate
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped>
.page {
  max-width: 90%;
  margin: 0 auto;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 20px;
  color: #000;
  line-height: 1.6;
  background: #ffffff50;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.post {
  margin-bottom: 40px;
  padding: 25px;
}

.post-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.post-title {
  font-size: 28px;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #7f8c8d;
}

.author {
  margin-right: 15px;
}

.rating {
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
}

.rating.high {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.rating.medium {
  background-color: #fff8e1;
  color: #f57f17;
}

.rating.low {
  background-color: #ffebee;
  color: #c62828;
}

.post-content {
  font-size: 16px;
  overflow-wrap: break-word;
}

.post-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

.post-content p {
  margin-bottom: 15px;
}

.comment-form {
  background: #6B80A5;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 2rem;
}

.comment-form-title {
  margin: 0 0 .5rem 0;
  font-size: 20px;
  font-weight: 500;
  color: #fff;
}

.form-title {
  margin-bottom: .5rem;
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.form-flex {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 2rem;
  width: 100%;
}

.form-group {
  width: 30%;
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  background-color: #f9f9f9;
  resize: vertical;
  transition: all 0.3s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #6e6e6e;
  background-color: #fff;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.stars {
  display: inline-block;
  margin-left: 10px;
}

.star {
  color: #ddd;
  cursor: pointer;
  font-size: 24px;
  transition: color 0.2s;
  margin-right: 5px;
}

.star.filled {
  color: #f1c40f;
}

.submit-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: .5rem;
}

.submit-btn {
  width: 15%;
  background-color: #fff;
  color: #82868C;
  border: none;
  padding: 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.submit-btn:hover {
  background-color: #82868C;
  color: #fff;
}

.submit-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.comments {
  background: #6B80A5;
  color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.comment {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.comment:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: 14px;
}

.user {
  font-weight: 600;
  margin-right: 15px;
}

.date {
  margin-right: 15px;
}

.comment-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
}

.comment-content p {
  width: 30%;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
}

.comment-content strong {
  color: #2c3e50;
}

.error {
  color: #e74c3c;
  background-color: #ffebee;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  border-left: 4px solid #e74c3c;
}

.author-link,
.user-link {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
  margin-right: 15px;
  transition: color 0.2s;
}

.author-link:hover,
.user-link:hover {
  color: #3498db;
  text-decoration: underline;
}

.post-meta .author-link {
  color: #7f8c8d;
}

.post-meta .author-link:hover {
  color: #3498db;
}

.comment-header .user-link {
  color: #fff;
}

.comment-header .user-link:hover {
  color: #f1c40f;
}

.auth-message {
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
  color: #2c3e50;
}

.auth-message a {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
}

.auth-message a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .page {
    padding: 15px;
  }
  
  .post-title {
    font-size: 24px;
  }
  
  .post, .comment-form, .comments {
    padding: 20px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user, .date {
    margin-bottom: 5px;
  }
}
</style>