<template>
  <div class="post-card">
    <router-link :to="'/post/' + post.id" class="post-link">
      <div class="post-image">
        <img :src="post.cover_image" :alt="post.title">
      </div>
      <div class="post-content">
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-meta">
          <span class="author">
            <i class="bi bi-person"></i> {{ post.username }}
          </span>
          <span class="date">
            <i class="bi bi-calendar"></i> {{ formatDate(post.created_at) }}
          </span>
        </div>
        <div class="post-stats">
          <span class="rating" v-if="post.rating !== null && post.rating !== undefined">
            <i class="bi bi-star-fill"></i> {{ post.rating.toFixed(1) }}
          </span>
          <span class="views">
            <i class="bi bi-eye"></i> {{ post.views }}
          </span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

defineProps({
  post: {
    type: Object,
    required: true,
    validator: (post) => {
      return [
        'id',
        'title',
        'cover_image',
        'username',
        'views',
        'created_at',
        'rating'
      ].every(key => key in post)
    }
  }
})
</script>

<style scoped>
.post-card {
  width: 225px;
  height: 240px; 
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  /* overflow: hidden; */
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.post-image {
  height: 120px;
  /* overflow: hidden; */
  position: relative;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.post-card:hover .post-image img {
  transform: scale(1.05);
}

.post-content {
  padding: 0.8rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  font-size: 0.95rem;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* overflow: hidden; */
  text-overflow: ellipsis;
  line-height: 1.3;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.post-stats {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.post-meta i,
.post-stats i {
  margin-right: 0.2rem;
  font-size: 0.75rem;
}

.rating {
  color: #ffc107;
  margin-right: 0.5rem;
}

.rating i {
  color: inherit;
}

@media (max-width: 768px) {
  .post-card {
    height: 100px;
  }
  
  .post-image {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .post-card {
    height: 90px;
  }
  
  .post-image {
    width: 90px;
    height: 90px;
  }
  
  .post-title {
    font-size: 0.85rem;
  }
}
</style>