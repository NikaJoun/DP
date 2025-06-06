<template>
  <div class="event-info-card">
    <div class="image-container" :class="{'tall': isImageTall, 'extra-tall': isImageExtraTall, 'square': isImageSquare}">
      <img
        v-if="event.image_path"
        :src="event.image_path"
        :alt="event.title"
        class="event-image"
        @load="handleImageLoad"
        @error="handleImageError"
      />
      <div v-else class="image-placeholder">
        <i class="bi bi-calendar-event"></i>
      </div>
    </div>
    
    <div class="event-header-content">
      <h1 class="event-title">{{ event.title }}</h1>
      <div class="event-dates">
        <i class="bi bi-calendar"></i> 
        {{ formatDate(event.start_date) }} — {{ formatDate(event.end_date) }}
      </div>
    </div>
    
    <div class="event-description">
      <h3><i class="bi bi-info-circle"></i> Описание</h3>
      <p>{{ event.description }}</p>
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  name: 'EventInfoCard',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isImageTall: false,
      isImageExtraTall: false,
      isImageSquare: false,
      defaultImage: 'https://via.placeholder.com/800x400/333/ffffff?text=Event+Image'
    };
  },
  methods: {
    handleImageLoad(e) {
      const img = e.target;
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = height / width;
      
      this.isImageTall = aspectRatio > 1.2 && aspectRatio <= 1.5;
      this.isImageExtraTall = aspectRatio > 1.5;
      this.isImageSquare = aspectRatio > 0.8 && aspectRatio < 1.2;
    },
    handleImageError(e) {
      e.target.src = this.defaultImage;
    },
    formatDate(date) {
      if (!date) return 'Дата не указана';
      try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return 'Неверная дата';
        
        return format(dateObj, 'dd.MM.yyyy', { locale: ru });
      } catch (e) {
        console.error('Ошибка форматирования даты:', e);
        return 'Ошибка даты';
      }
    }
  }
};
</script>

<style scoped>
.event-info-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  /* overflow: hidden; */
  height: fit-content;
  position: sticky;
  top: 1rem;
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #f8f9fa;
  /* overflow: hidden; */
  border-radius: 12px 12px 0 0;
}

.image-container.tall {
  padding-top: 120%;
}

.image-container.extra-tall {
  padding-top: 150%;
}

.image-container.square {
  padding-top: 100%;
}

.event-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.event-image:hover {
  transform: scale(1.03);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  color: #dee2e6;
  background: #f1f3f5;
}

.event-header-content {
  padding: 1.5rem 1.5rem 0;
  text-align: center;
}

.event-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.event-dates {
  font-size: 1rem;
  color: #555;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.event-description {
  padding: 0 1.5rem 1.5rem;
}

.event-description h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.event-description p {
  line-height: 1.6;
  color: #555;
  font-size: 0.95rem;
}

@media (max-width: 991px) {
  .event-info-card {
    position: static;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .event-title {
    font-size: 1.3rem;
  }
  
  .event-description h3 {
    font-size: 1rem;
  }
  
  .event-description p {
    font-size: 0.9rem;
  }
}

@media (max-width: 768px) {
  .event-info-card {
    padding: 0.5rem;
  }
  
  .event-header-content {
    padding: 1rem 1rem 0;
  }
  
  .event-title {
    font-size: 1.2rem;
  }
  
  .event-dates {
    font-size: 0.9rem;
  }
  
  .event-description {
    padding: 0 1rem 1rem;
  }
}

@media (max-width: 480px) {
  .event-title {
    font-size: 1.1rem;
  }
  
  .event-dates {
    font-size: 0.85rem;
  }
}
</style>