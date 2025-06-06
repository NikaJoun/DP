<template>
  <div class="popular-posts">
    <h5>Популярные публикации</h5>
    <ul>
      <li 
        v-for="post in popularPosts" 
        :key="post.id" 
        @click="$router.push(`/post/${post.id}`)"
      >
        {{ post.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/homeStore'

const homeStore = useHomeStore()
const { popularPosts } = storeToRefs(homeStore)
</script>

<style scoped>
.popular-posts {
  background: #f8f9fa;
  padding: 20px 25px;
  border-radius: 20px;
  box-shadow: -10px 10px 25px rgba(0, 0, 0, 0.05);
}

.popular-posts h5 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.popular-posts ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.popular-posts li {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  margin-bottom: 6px;
}

.popular-posts li:hover {
  color: #007bff;
}
</style>