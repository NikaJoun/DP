<template>
  <div class="comment-form mt-4">
    <h3>Оставить комментарий</h3>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label for="liked" class="form-label">Что понравилось?</label>
        <textarea 
          id="liked" 
          class="form-control" 
          v-model="form.liked" 
          :disabled="isLoading"
          required
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="disliked" class="form-label">Что не понравилось?</label>
        <textarea 
          id="disliked" 
          class="form-control" 
          v-model="form.disliked" 
          :disabled="isLoading"
          required
        ></textarea>
      </div>
      <div class="mb-3">
        <label for="impression" class="form-label">Общее впечатление</label>
        <textarea 
          id="impression" 
          class="form-control" 
          v-model="form.overall_impression" 
          :disabled="isLoading"
          required
        ></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Оценка</label>
        <div class="star-rating">
          <span 
            v-for="n in 5" 
            :key="n" 
            :class="['bi', n <= form.rating ? 'bi-star-fill' : 'bi-star']" 
            @click="form.rating = n"
            :style="{ cursor: isLoading ? 'not-allowed' : 'pointer' }"
          ></span>
        </div>
      </div>
      <button 
        type="submit" 
        class="btn btn-primary"
        :disabled="isLoading"
      >
        <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
        {{ isLoading ? 'Отправка...' : 'Отправить комментарий' }}
      </button>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit'],
  data() {
    return {
      form: {
        liked: '',
        disliked: '',
        overall_impression: '',
        rating: 5
      }
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('submit', { ...this.form })
      this.form.liked = ''
      this.form.disliked = ''
      this.form.overall_impression = ''
      this.form.rating = 5
    }
  }
}
</script>

<style scoped>
.comment-form {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.star-rating {
  font-size: 1.5rem;
  color: #ffc107;
}

.star-rating .bi {
  margin-right: 5px;
}
</style>