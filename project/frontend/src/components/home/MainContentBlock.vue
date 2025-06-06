<template>
  <div class="main-content">
    <LeftColumn />
    <CenterColumn />
    <RightColumn />
  </div>
</template>

<script setup>
import LeftColumn from '@/components/home/LeftColumn.vue'
import CenterColumn from '@/components/home/CenterColumn.vue'
import RightColumn from '@/components/home/RightColumn.vue'
</script>

<style scoped>
.main-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 4rem;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (max-width: 992px) {
  .main-content {
    flex-direction: column;
    align-items: center;
  }
}
</style>