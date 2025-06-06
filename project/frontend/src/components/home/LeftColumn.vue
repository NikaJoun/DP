<template>
  <div class="left-column">
    <div v-if="nextEvent">
      <CycloneTimer 
        :eventDate="nextEvent.start_date"
        :endDate="nextEvent.end_date"
        :eventTitle="nextEvent.title"
      />
      <NextCyclonePreview :nextEvent="nextEvent" />
    </div>
    <div v-else class="no-events">
      <p>Нет запланированных мероприятий</p>
    </div>
  </div>
</template>

<script setup>
import CycloneTimer from '@/components/events/CycloneTimer.vue'
import NextCyclonePreview from '@/components/events/NextCyclonePreview.vue'
import { storeToRefs } from 'pinia'
import { useHomeStore } from '@/stores/homeStore'

const homeStore = useHomeStore()
const { nextEvent } = storeToRefs(homeStore)
</script>

<style scoped>
.left-column {
  flex: 1;
  min-width: 250px;
}
</style>