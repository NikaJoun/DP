<template>
  <div class="empty-state">
    <i :class="'bi ' + icon"></i>
    <p><slot></slot></p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
  icon: {
    type: String,
    default: 'bi-info-circle'
  }
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}
</style>