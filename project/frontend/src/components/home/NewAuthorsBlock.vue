<template>
  <div class="new-authors">
    <h5>Новые авторы</h5>
    <ul>
      <li v-for="author in newAuthors" :key="author.id">
        <router-link 
          :to="'/user/' + author.id" 
          class="author-link"
        >
          {{ author.username }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/homeStore'

const homeStore = useHomeStore()
const { newAuthors } = storeToRefs(homeStore)
</script>

<style scoped>
.new-authors {
  background: #f8f9fa;
  padding: 20px 25px;
  border-radius: 20px;
  box-shadow: -10px 10px 25px rgba(0, 0, 0, 0.05);
}

.new-authors h5 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.new-authors ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.new-authors li {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  margin-bottom: 6px;
}

.author-link {
  color: inherit;
  text-decoration: none;
  display: block;
  padding: 2px 0;
}

.author-link:hover {
  color: #007bff;
}
</style>