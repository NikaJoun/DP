<template>
  <div class="home-container">
    <MainContentBlock />
    <AuthSection />
    <SearchSection />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHomeStore } from '@/stores/homeStore'
import MainContentBlock from '@/components/home/MainContentBlock.vue'
import AuthSection from '@/components/home/AuthSection.vue'
import SearchSection from '@/components/home/SearchSection.vue'

const homeStore = useHomeStore()

onMounted(() => {
  homeStore.initData()
})
</script>

<style scoped>
.home-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 1rem;
}
</style>