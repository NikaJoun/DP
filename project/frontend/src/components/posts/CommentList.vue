<template>
  <div class="comments-section mt-4">
    <h3>Комментарии</h3>
    
    <div v-if="isLoading" class="text-center my-3">
      <div class="spinner-border spinner-border-sm"></div>
    </div>
    
    <div v-else-if="!comments.length" class="alert alert-info">
      Пока нет комментариев. Будьте первым!
    </div>
    
    <ul v-else class="list-group">
      <li v-for="comment in comments" :key="comment.id" class="list-group-item mb-2">
        <div class="d-flex justify-content-between align-items-start">
          <h5 class="mb-1">{{ comment.username }}</h5>
          <div class="star-rating">
            <span 
              v-for="n in 5" 
              :key="n" 
              :class="['bi', n <= comment.rating ? 'bi-star-fill' : 'bi-star']"
            ></span>
          </div>
        </div>
        <div class="mt-2">
          <p class="mb-1"><strong>Понравилось:</strong> {{ comment.liked }}</p>
          <p class="mb-1"><strong>Не понравилось:</strong> {{ comment.disliked }}</p>
          <p class="mb-0"><strong>Общее впечатление:</strong> {{ comment.overall_impression }}</p>
        </div>
        <small class="text-muted">{{ formatDate(comment.created_at) }}</small>
      </li>
    </ul>
  </div>
</template>

<script>
import { format } from 'date-fns'

export default {
  props: {
    comments: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(dateString) {
      try {
        return format(new Date(dateString), 'dd.MM.yyyy HH:mm')
      } catch {
        return dateString
      }
    }
  }
}
</script>

<style scoped>
.comments-section {
  margin-top: 40px;
}

.star-rating {
  color: #ffc107;
  font-size: 0.9rem;
}

.list-group-item {
  border-radius: 0.5rem;
}
</style>