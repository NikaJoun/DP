<template>
  <div class="tab-menu">
    <button :class="['tab-btn', { active: isLogin }]" @click="toggleForm(true)">Вход</button>
    <button :class="['tab-btn', { active: !isLogin }]" @click="toggleForm(false)">Регистрация</button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
defineProps({
  isLogin: Boolean
})

const emit = defineEmits(['toggle'])

const toggleForm = (val) => {
  emit('toggle', val)
}
</script>

<style scoped>
.tab-menu {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.tab-btn.active {
  color: #0088cc;
  font-weight: 500;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background-color: #0088cc;
}
</style>