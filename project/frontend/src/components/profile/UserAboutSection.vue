<template>
  <div class="about-section">
    <h3>О пользователе</h3>
    <p>{{ about }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
  about: String
})
</script>

<style scoped>
.about-section {
  padding: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.about-section h3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}
</style>