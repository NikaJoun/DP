<template>
  <div class="event-page">
    <div class="event-content">
      <EventInfoCard :event="event" />
      
      <EventTasksSection
        :event="event"
        :loading="loading"
        :initial-task-id="$route.params.taskId"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EventInfoCard from '@/components/active-event/EventInfoCard.vue';
import EventTasksSection from '@/components/active-event/EventTasksSection.vue';

export default {
  name: 'EventTaskPage',
  components: {
    EventInfoCard,
    EventTasksSection
  },
  data() {
    return {
      event: {},
      loading: true
    };
  },
  computed: {
    eventId() {
      return this.$route.params.id;
    }
  },
  methods: {
    async fetchEvent() {
      try {
        this.loading = true;
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(`/api/events/${this.eventId}`, config);
        
        if (!response.data) {
          this.$router.push({ name: 'NotFound' });
          return;
        }
        
        this.event = response.data;
        
        const tasksResponse = await axios.get(`/api/events/${this.eventId}/tasks`, config);
        this.event.tasks = tasksResponse.data;
        
      } catch (error) {
        console.error('Ошибка при загрузке мероприятия:', error);
        if (error.response && error.response.status === 404) {
          this.$router.push({ name: 'NotFound' });
        } else {
          this.$router.push('/');
        }
      } finally {
        this.loading = false;
      }
    }
  },
  watch: {
    eventId: {
      immediate: true,
      handler() {
        this.fetchEvent();
      }
    }
  },
  mounted() {
    this.fetchEvent();
  }
};
</script>

<style scoped>
.event-page {
  min-height: 100vh;
  overflow: auto;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #333;
}

.event-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 992px) {
  .event-content {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 768px) {
  .event-page {
    padding: 1rem;
  }
}
</style>