<template>
  <div class="alert-message" :class="'alert-' + type">
    {{ message }}
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
  message: String,
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  }
})
</script>

<style scoped>
.alert-message {
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: center;
}

.alert-info {
  background-color: rgba(0, 123, 255, 0.1);
  color: rgba(0, 123, 255, 0.8);
}

.alert-success {
  background-color: rgba(40, 167, 69, 0.1);
  color: rgba(40, 167, 69, 0.8);
}

.alert-warning {
  background-color: rgba(255, 193, 7, 0.1);
  color: rgba(255, 193, 7, 0.8);
}

.alert-error {
  background-color: rgba(220, 53, 69, 0.1);
  color: rgba(220, 53, 69, 0.8);
}
</style>