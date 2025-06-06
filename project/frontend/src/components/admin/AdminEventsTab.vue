<template>
  <div class="events-container">
    <div class="event-controls">
      <h2>Мероприятия</h2>
      <button @click="openEventForm" class="add-event-btn">+ Добавить мероприятие</button>
    </div>

    <EventForm
      v-if="isEventFormVisible"
      :event="selectedEvent"
      :isVisible="isEventFormVisible"
      :existingEvents="events"
      @submit="handleEventSubmit"
      @cancel="isEventFormVisible = false"
      @error="showError"
    />

    <div class="filters-container">
      <div class="search-filter">
        <input 
          v-model="searchQuery" 
          placeholder="Поиск по названию" 
          class="search-input"
        >
      </div>

      <div class="date-range-filter">
        <div class="date-picker">
          <label>Начало:</label>
          <input 
            type="date" 
            v-model="startDateFilter" 
            class="date-input"
            @change="applyDateFilters"
          >
        </div>
        <div class="date-picker">
          <label>Конец:</label>
          <input 
            type="date" 
            v-model="endDateFilter" 
            class="date-input"
            @change="applyDateFilters"
          >
        </div>
        <button 
          @click="resetDateFilters" 
          class="reset-btn"
        >
          Сбросить
        </button>
      </div>

      <div class="sort-options">
        <select v-model="sortField" class="sort-select">
          <option value="startDate">Сортировать по дате начала</option>
          <option value="endDate">Сортировать по дате окончания</option>
          <option value="title">Сортировать по названию</option>
        </select>
        <button 
          @click="toggleSortOrder" 
          class="sort-direction-btn"
        >
          {{ sortAsc ? '↑' : '↓' }}
        </button>
      </div>
    </div>

    <h3>Список мероприятий</h3>
    <div v-if="filteredEvents.length" class="events-list">
      <div v-for="event in filteredEvents" :key="event.id" class="event-card">
        <div class="event-info">
          <h4>{{ event.title }}</h4>
          <div class="event-dates">
            <div class="date-range">
              <span class="date-label">Начало:</span>
              <span class="date-value">{{ formatDateTime(event.start_date) }}</span>
            </div>
            <div class="date-range">
              <span class="date-label">Окончание:</span>
              <span class="date-value">{{ formatDateTime(event.end_date) }}</span>
            </div>
          </div>
          <p class="event-description">{{ event.description }}</p>
        </div>
        <div class="event-actions">
          <button 
            @click="editEvent(event)" 
            class="edit-btn"
            :disabled="isEventStarted(event)"
          >
            Редактировать
          </button>
          <button 
            @click="deleteEvent(event.id)" 
            class="delete-btn"
            :disabled="isEventStarted(event)"
          >
            Удалить
          </button>
          <span 
            v-if="isEventStarted(event)" 
            class="edit-disabled-tooltip"
          >
            Редактирование запрещено, мероприятие уже началось
          </span>
        </div>
      </div>
    </div>
    <p v-else class="no-events">Нет мероприятий для отображения</p>
  </div>
</template>

<script>
import axios from 'axios';
import EventForm from '@/components/events/EventForm.vue';

export default {
  name: 'AdminEventsTab',
  components: {
    EventForm
  },
  data() {
    return {
      events: [],
      isEventFormVisible: false,
      selectedEvent: null,
      searchQuery: '',
      startDateFilter: '',
      endDateFilter: '',
      sortField: 'startDate',
      sortAsc: false
    };
  },
  computed: {
    filteredEvents() {
      let result = [...this.events];

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(event => 
          event.title.toLowerCase().includes(query)
        );
      }

      if (this.startDateFilter) {
        const startDate = new Date(this.startDateFilter);
        result = result.filter(event => 
          new Date(event.start_date) >= startDate
        );
      }

      if (this.endDateFilter) {
        const endDate = new Date(this.endDateFilter);
        result = result.filter(event => 
          new Date(event.end_date) <= endDate
        );
      }

      result.sort((a, b) => {
        let comparison = 0;
        
        if (this.sortField === 'title') {
          comparison = a.title.localeCompare(b.title);
        } else {
          const dateA = new Date(a[this.sortField === 'startDate' ? 'start_date' : 'end_date']);
          const dateB = new Date(b[this.sortField === 'startDate' ? 'start_date' : 'end_date']);
          comparison = dateA - dateB;
        }

        return this.sortAsc ? comparison : -comparison;
      });

      return result;
    }
  },
  created() {
    this.fetchEvents();
  },
  methods: {
    async fetchEvents() {
      try {
        const res = await axios.get('/api/events', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.events = res.data;
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка получения мероприятий', true);
      }
    },
    openEventForm() {
      this.selectedEvent = null;
      this.isEventFormVisible = true;
    },
    editEvent(event) {
      this.selectedEvent = event;
      this.isEventFormVisible = true;
    },
    isEventStarted(event) {
      return new Date(event.start_date) <= new Date();
    },
    async handleEventSubmit(formData) {
      try {
        const token = localStorage.getItem('token');
        const method = this.selectedEvent ? 'put' : 'post';
        const url = this.selectedEvent 
          ? `/api/events/${this.selectedEvent.id}`
          : '/api/events';
        
        await axios[method](url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        this.isEventFormVisible = false;
        await this.fetchEvents();
        this.$emit('show-message',
          this.selectedEvent 
            ? 'Мероприятие успешно обновлено' 
            : 'Мероприятие успешно создано'
        );
      } catch (err) {
        console.error('Ошибка при сохранении мероприятия:', err);
        this.$emit('show-message',
          err.response?.data?.message || 'Произошла ошибка при сохранении', 
          true
        );
      }
    },
    async deleteEvent(eventId) {
      if (!confirm('Вы уверены, что хотите удалить это мероприятие? Все связанные задания также будут удалены.')) {
        return;
      }
      
      try {
        await axios.delete(`/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        this.$emit('show-message', 'Мероприятие успешно удалено');
        this.fetchEvents();
      } catch (err) {
        console.error(err);
        this.$emit('show-message', err.response?.data?.message || 'Ошибка при удалении мероприятия', true);
      }
    },
    formatDateTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('ru-RU', options);
    },
    toggleSortOrder() {
      this.sortAsc = !this.sortAsc;
    },
    applyDateFilters() {
      if (this.startDateFilter && this.endDateFilter && new Date(this.startDateFilter) > new Date(this.endDateFilter)) {
        alert('Дата начала не может быть позже даты окончания');
        this.startDateFilter = '';
        this.endDateFilter = '';
      }
    },
    resetDateFilters() {
      this.startDateFilter = '';
      this.endDateFilter = '';
    },
    showError(message) {
      this.$emit('show-message', message, true);
    },
  }
};
</script>

<style scoped>
.events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.event-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
  padding: 0 10px;
}

.event-controls h2 {
  margin: 0;
  color: #2c3e50;
}

.add-event-btn {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  height: 40px;
}

.add-event-btn:hover {
  background-color: #27ae60;
  transform: translateY(-1px);
}

.add-event-btn:active {
  transform: translateY(0);
}

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-filter {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #3498db;
  outline: none;
}

.date-range-filter {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.date-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-picker label {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.date-input:focus {
  border-color: #3498db;
  outline: none;
}

.reset-btn {
  padding: 8px 15px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #7f8c8d;
  transform: translateY(-1px);
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 200px;
  background-color: white;
}

.sort-direction-btn {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sort-direction-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 25px;
  margin-top: 20px;
  padding: 10px;
}

.event-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.event-info h4 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 1.2em;
  margin-bottom: 15px;
}

.event-dates {
  margin: 15px 0;
}

.date-range {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.date-label {
  font-weight: 500;
  color: #555;
  margin-right: 10px;
  min-width: 80px;
}

.date-value {
  color: #2c3e50;
  font-size: 0.95em;
  flex: 1;
}

.event-description {
  color: #7f8c8d;
  font-size: 0.9em;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  /* overflow: hidden; */
}

.event-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.edit-btn, .delete-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 0.9em;
  flex: 1;
  min-width: calc(50% - 5px);
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.edit-btn:hover:not(:disabled), 
.delete-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.edit-btn:disabled,
.delete-btn:disabled {
  background-color: #f5f5f5;
  color: #bdc3c7;
  cursor: not-allowed;
  border: 1px solid #e0e0e0;
  transform: none;
  order: 2;
  flex: 1 0 100%;
}

.edit-disabled-tooltip {
  display: block;
  width: 100%;
  font-size: 0.75em;
  color: #e74c3c;
  padding: 8px;
  background-color: #fdeded;
  border-radius: 4px;
  margin-top: 5px;
  text-align: center;
  line-height: 1.4;
  order: 1;
}

.no-events {
  text-align: center;
  color: #7f8c8d;
  margin-top: 30px;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .event-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-event-btn {
    width: 100%;
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-filter, .sort-select {
    width: 100%;
  }
  
  .date-range-filter {
    width: 100%;
    justify-content: space-between;
  }
  
  .events-list {
    grid-template-columns: 1fr;
  }
  
  .edit-btn, .delete-btn {
    min-width: 100%;
  }
}
</style>