<template>
  <div class="next-cyclone">
    <h3 v-if="isEventActive">Текущее мероприятие</h3>
    <h3 v-else>Следующее мероприятие</h3>
    
    <div v-if="nextEvent" class="event-preview">
      <h4>{{ nextEvent.title }}</h4>
      <button @click="openModal" class="details-btn">Подробнее</button>
    </div>
    
    <div v-else class="no-events">
      <p>Нет запланированных мероприятий</p>
    </div>

    <div v-if="isModalOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeModal">×</button>
        <EventPreview :event="nextEvent" />
      </div>
    </div>
  </div>
</template>

<script>
import EventPreview from './EventPreview.vue';

export default {
  components: {
    EventPreview
  },
  props: {
    nextEvent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isModalOpen: false,
      isEventActive: false,
      checkInterval: null
    };
  },
  mounted() {
    this.checkEventStatus();
    this.checkInterval = setInterval(this.checkEventStatus, 60000);
  },
  beforeUnmount() {
    clearInterval(this.checkInterval);
  },
  methods: {
    checkEventStatus() {
      if (!this.nextEvent) return;
      
      const now = new Date();
      const startDate = new Date(this.nextEvent.start_date);
      const endDate = new Date(this.nextEvent.end_date);
      
      this.isEventActive = now >= startDate && now < endDate;
    },
    openModal() {
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
    }
  }
}
</script>

<style scoped>
.next-cyclone {
  border-radius: 100px;
  background: #E3E6EB;
  box-shadow: -10px 10px 25px 0px rgba(0, 0, 0, 0.25);
  padding: 15px;
  display: inline-flex;
  padding: 15px 40px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 5rem;
  margin-left: 3rem;
  position: relative;
}

.next-cyclone h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.event-preview {
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  align-items: flex-end;
}

.event-preview h4 {
  font-size: .8rem;
  font-style: normal;
  font-weight: 400;
}

.details-btn {
  display: flex;
  padding: 5px 20px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 40px;
  background: #FFF;
  color: #333;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #6B80A5;
  padding: 20px;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}
</style>