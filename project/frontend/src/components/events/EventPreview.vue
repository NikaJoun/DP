<template>
  <div v-if="event" class="event-card">
    <div class="event-container">
      <img :src="event.image_path" alt="Event Image" class="event-image" />

      <div class="event-content">
        <h3 class="event-title">{{ event.title }}</h3>
        <p class="event-description">{{ event.description }}</p>

        <div class="event-dates">
          <div class="date-item">
            <span class="date-label">Начало:</span>
            <span class="date-value">{{ formatDate(event.start_date) }}</span>
          </div>
          <div class="date-item">
            <span class="date-label">Окончание:</span>
            <span class="date-value">{{ formatDate(event.end_date) }}</span>
          </div>
        </div>

        <button 
          v-if="hasEventStarted"
          class="participate-btn"
          @click="handleAction"
        >
          Подробнее
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventPreview',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasEventStarted() {
      return new Date(this.event.start_date) <= new Date();
    }
  },
  methods: {
    formatDate(dateStr) {
      const options = {
        day: 'numeric',
        month: 'long',
      };
      return new Date(dateStr).toLocaleDateString('ru-RU', options);
    },
    handleAction() {
      this.$router.push(`/event-task/${this.event.id}`);
    }
  }
};
</script>

<style scoped>
.event-card {
  width: 100%;
  /* overflow: hidden; */
}

.event-container {
  display: flex;
  align-items: stretch;
  min-height: 300px;
}

.event-image {
  width: 250px;
  object-fit: contain;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
}

.event-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
}

.event-description {
  margin: 0;
  color: #EADDC3;
  line-height: 1.5;
  font-size: 0.95rem;
}

.event-dates {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.9rem;
}

.date-item {
  display: flex;
  gap: 8px;
}

.date-label {
  font-weight: 500;
  color: #fff;
}

.date-value {
  color: #ffffff;
}

.participate-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #ffffff;
  color: rgb(108, 108, 108);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.participate-btn:hover {
  background: #6b6b6b;
  color: white;
}

@media (max-width: 768px) {
  .event-container {
    flex-direction: column;
  }

  .event-image {
    width: 100%;
    max-height: 200px;
    object-fit: contain;
  }
}
</style>
