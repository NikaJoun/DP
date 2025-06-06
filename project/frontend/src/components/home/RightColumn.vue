<template>
  <div class="right-column">
    <NewAuthorsBlock />
    <PopularPostsBlock />
  </div>
</template>

<script setup>
import NewAuthorsBlock from '@/components/home/NewAuthorsBlock.vue'
import PopularPostsBlock from '@/components/home/PopularPostsBlock.vue'
</script>

<style scoped>
.right-column {
  flex: 1;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>