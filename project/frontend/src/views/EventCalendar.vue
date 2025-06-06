<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="month-navigator">
        <button @click="prevMonth" class="nav-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 class="month-title">{{ formatMonthYear(currentDate) }}</h2>
        <button @click="nextMonth" class="nav-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="day-header" v-for="(day, index) in weekDays" :key="index">
        {{ day }}
      </div>

      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="calendar-day"
        :class="{
          'empty': !day,
          'current-day': isCurrentDay(day),
          'weekend': day && (day.getDay() === 0 || day.getDay() === 6),
          'has-event': day && hasEvent(day),
          'has-task': day && hasTask(day)
        }"
      >
        <template v-if="day">
          <div class="day-number-container">
            <span class="day-number">{{ day.getDate() }}</span>
            <span class="day-weekname" v-if="day.getDate() === 1 || isCurrentDay(day)">
              {{ formatDayName(day) }}
            </span>
          </div>

          <div class="event-indicator" v-if="hasEvent(day)" @click.stop="showEventPreview(getEvent(day))">
            <div class="event-badge" :class="getEventType(day, getEvent(day))">
              {{ getEvent(day).title }}
            </div>
            <span
              class="event-label"
              :class="getEventType(day, getEvent(day)) === 'event-start' ? 'start-label' : 'end-label'"
            >
              {{ getEventType(day, getEvent(day)) === 'event-start' ? 'Начало' : 'Конец' }}
            </span>
          </div>

          <div class="task-indicator" v-if="hasTask(day)">
            <div class="task-badge">
              <div v-for="(task, index) in getTasksForDay(day)" :key="index">
                {{ task.title }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-if="showPreview" class="modal-overlay" @click.self="closePreview">
      <div class="modal-content">
        <button class="modal-close" @click="closePreview">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <EventPreview :event="selectedEvent" />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import EventPreview from '@/components/events/EventPreview.vue';

export default {
  name: 'EventCalendar',
  components: {
    EventPreview
  },
  data() {
    return {
      events: [],
      tasks: [],
      currentDate: new Date(),
      showPreview: false,
      selectedEvent: null
    };
  },
  computed: {
    weekDays() {
      return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const startDay = (firstDayOfMonth.getDay() + 6) % 7;
      const totalDays = lastDayOfMonth.getDate();

      const days = [];

      for (let i = 0; i < startDay; i++) {
        days.push(null);
      }

      for (let i = 1; i <= totalDays; i++) {
        days.push(new Date(year, month, i));
      }

      return days;
    }
  },
  methods: {
    showEventPreview(event) {
      this.selectedEvent = event;
      this.showPreview = true;
      document.body.style.overflow = 'hidden';
    },
    closePreview() {
      this.showPreview = false;
      document.body.style.overflow = 'auto';
    },
    async fetchEventsAndTasks() {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const eventsRes = await axios.get('/api/events', config);
        this.events = eventsRes.data;

        const tasksPromises = this.events.map(event =>
          axios.get(`/api/events/${event.id}/tasks`, config)
        );

        const tasksResponses = await Promise.all(tasksPromises);
        this.tasks = tasksResponses.flatMap(res => res.data?.tasks || res.data || []);
      } catch (error) {
        console.error('Error fetching events and tasks:', error);
      }
    },
    formatMonthYear(date) {
      return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    },
    formatDayName(day) {
      return day.toLocaleDateString('ru-RU', { weekday: 'short' });
    },
    hasEvent(day) {
      if (!day) return false;
      const dayStr = day.toISOString().split('T')[0];
      return this.events.some(event => {
        const start = event.start_date.split('T')[0];
        const end = event.end_date.split('T')[0];
        return start === dayStr || end === dayStr;
      });
    },
    getEvent(day) {
      if (!day) return null;
      const dayStr = day.toISOString().split('T')[0];
      return this.events.find(event => {
        const start = event.start_date.split('T')[0];
        const end = event.end_date.split('T')[0];
        return start === dayStr || end === dayStr;
      });
    },
    hasTask(day) {
      if (!day) return false;
      const calendarDayStr = this.formatLocalDate(day);
      return this.tasks.some(task => {
        const taskDate = new Date(task.release_date);
        const taskDayStr = this.formatLocalDate(taskDate);
        return calendarDayStr === taskDayStr;
      });
    },
    getTasksForDay(day) {
      if (!day) return [];
      const calendarDayStr = this.formatLocalDate(day);
      return this.tasks.filter(task => {
        const taskDate = new Date(task.release_date);
        const taskDayStr = this.formatLocalDate(taskDate);
        return calendarDayStr === taskDayStr;
      });
    },
    formatLocalDate(date) {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    getEventType(day, event) {
      if (!event) return '';
      const dayStr = day.toISOString().split('T')[0];
      if (event.start_date.split('T')[0] === dayStr) return 'event-start';
      if (event.end_date.split('T')[0] === dayStr) return 'event-end';
      return '';
    },
    prevMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.currentDate = new Date(this.currentDate);
      this.fetchEventsAndTasks();
    },
    nextMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.currentDate = new Date(this.currentDate);
      this.fetchEventsAndTasks();
    },
    isCurrentDay(day) {
      if (!day) return false;
      const today = new Date();
      return (
        day.getDate() === today.getDate() &&
        day.getMonth() === today.getMonth() &&
        day.getFullYear() === today.getFullYear()
      );
    }
  },
  mounted() {
    this.fetchEventsAndTasks();
  }
};
</script>

<style scoped>
.calendar-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
  font-weight: 700;
  color: #333;
}

.calendar-header {
  margin-bottom: .5rem;
  text-align: center;
}

.month-navigator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.month-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  min-width: 200px;
}

.nav-button {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.nav-button svg {
  color: #4a5568;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.1rem;
}

.day-header {
  text-align: center;
  padding: 0.5rem 0;
  font-weight: 600;
  color: #4a5568;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.calendar-day {
  background: white;
  border-radius: 8px;
  min-height: 85px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  position: relative;
}

.calendar-day:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: #e0e0e0;
}

.calendar-day.empty {
  background: transparent;
  box-shadow: none;
  border: none;
}

.calendar-day.weekend {
  background: #fafafa;
}

.calendar-day.current-day {
  border: 2px solid #6366f1;
  background: linear-gradient(135deg, #f0f4ff 0%, #f8faff 100%);
}

.calendar-day.has-event {
  background: #f8f9ff;
  border-color: #e0e0ff;
}

.calendar-day.has-task {
  background: #fff9f0;
  border-color: #ffe8cc;
}

.day-number-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.day-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.current-day .day-number {
  color: #6366f1;
}

.day-weekname {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  color: #666;
}

.current-day .day-weekname {
  color: #6366f1;
}

.event-indicator {
  margin-top: 2px;
}

.event-badge {
  font-size: 0.65rem;
  padding: 3px 6px;
  border-radius: 8px;
  font-weight: 500;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  cursor: pointer;
  transition: transform 0.2s;
}

.event-badge:hover {
  transform: scale(1.02);
}

.event-start {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.event-end {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.event-label {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.6rem;
  padding: 2px 5px;
  border-radius: 6px;
  font-weight: 600;
  z-index: 2;
  pointer-events: none;
  text-transform: uppercase;
  white-space: nowrap;
}

.start-label {
  background-color: #e0e7ff;
  color: #4338ca;
}

.end-label {
  background-color: #d1fae5;
  color: #065f46;
}

.task-indicator {
  margin-top: 2px;
}

.task-badge {
  font-size: 0.65rem;
  padding: 3px 6px;
  border-radius: 8px;
  font-weight: 500;
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #6B80A5;
  padding: 20px;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  padding: 5px;
}

.modal-close svg {
  width: 24px;
  height: 24px;
}

@media (max-width: 768px) {
  .calendar-container {
    padding: 0.5rem;
  }
  
  .month-title {
    font-size: 1.2rem;
  }
  
  .calendar-day {
    min-height: 70px;
    padding: 4px;
  }
  
  .day-number {
    font-size: 0.8rem;
  }
  
  .event-badge, .task-badge {
    font-size: 0.6rem;
    padding: 2px 4px;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>