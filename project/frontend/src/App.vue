<template>
  <div class="app-container">
    <AppNavbar />
    
    <div class="fab-bottom-left" :class="{ open: isFabOpen }">
      <button class="fab-main" @click="toggleFab">
        <img src="@/assets/images/share-icon.png" alt="Share" />
      </button>
      <div class="fab-actions-right">
        <a href="https://vk.com/nikajoun" target="_blank" class="fab-icon vk">
          <img src="@/assets/images/vk-icon.png" alt="VK" />
        </a>
        <a href="https://t.me/nikajoun" target="_blank" class="fab-icon tg">
          <img src="@/assets/images/telegram-icon.png" alt="Telegram" />
        </a>
        <a href="mailto:viktoriaantonin@gmail.com" target="_blank" class="fab-icon email">
          <img src="@/assets/images/email-icon.png" alt="Email" />
        </a>
      </div>
    </div>

    <div class="content">
      <router-view />
    </div>

    <div class="footer">by NikaJoun</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppNavbar from '@/components/AppNavbar.vue';

const isFabOpen = ref(false);

const toggleFab = () => {
  isFabOpen.value = !isFabOpen.value;
};
</script>

<style>
body {
  margin: 0;
  background-image: url(./assets/images/background.png);
  background-attachment: fixed;
  min-height: 100vh;
  font-family: 'Montserrat', sans-serif;
}

.app-container {
  font-family: 'Montserrat', sans-serif;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  position: relative;
}

.content {
  z-index: 3;
  flex-grow: 1;
  margin-left: 60px;
  background-color: transparent;
  min-height: calc(100vh - 40px);
}

.footer {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-family: 'Hatigek Batagor', sans-serif;
  font-size: 14px;
  color: #333;
  z-index: 10;
  mix-blend-mode: multiply;
}

.fab-bottom-left {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
}

.fab-main {
  background-color: #f8f9fa;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.fab-main img {
  width: 28px;
  height: 28px;
}

.fab-bottom-left.open .fab-main {
  transform: rotate(45deg);
}

.fab-actions-right {
  display: flex;
  gap: 16px;
  margin-left: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.fab-bottom-left.open .fab-actions-right {
  opacity: 1;
  pointer-events: auto;
}

.fab-icon {
  width: 44px;
  height: 44px;
  background-color: #f8f9fa;
  border-radius: 50%;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateX(-20px) scale(0.5);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fab-bottom-left.open .fab-icon {
  transform: translateX(0) scale(1);
  opacity: 1;
}

.fab-actions-right .fab-icon:nth-child(1) {
  transition-delay: 0.05s;
}
.fab-actions-right .fab-icon:nth-child(2) {
  transition-delay: 0.1s;
}
.fab-actions-right .fab-icon:nth-child(3) {
  transition-delay: 0.15s;
}

.fab-icon:hover {
  background-color: #969696;
  transform: translateY(-2px) scale(1.05);
}

.fab-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>