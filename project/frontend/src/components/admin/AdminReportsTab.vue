<template>
  <div class="admin-reports">
    <div class="report-controls">
      <div class="period-selector">
        <label for="period-select">Период:</label>
        <select 
          id="period-select" 
          v-model="selectedPeriod" 
          @change="handlePeriodChange"
          class="period-select"
        >
          <option value="">Все время</option>
          <option value="today">Сегодня</option>
          <option value="this_week">Эта неделя</option>
          <option value="this_month">Этот месяц</option>
          <option value="this_year">Этот год</option>
          <option value="custom">Свой период</option>
        </select>
        
        <div v-if="selectedPeriod === 'custom'" class="custom-period">
          <input 
            type="date" 
            v-model="startDate" 
            :max="endDate || today"
            class="date-input"
          >
          <span class="date-separator">по</span>
          <input 
            type="date" 
            v-model="endDate" 
            :min="startDate" 
            :max="today"
            class="date-input"
          >
        </div>
      </div>
      
      <div class="report-buttons">
        <button @click="generateUserReports" class="report-btn">
          <i class="fas fa-users"></i> Отчет по участникам
        </button>
        <button @click="generatePostReports" class="report-btn">
          <i class="fas fa-book"></i> Отчет по публикациям
        </button>
      </div>
      
      <div v-if="userReports" class="export-buttons">
        <button @click="exportReport('users', 'pdf')" class="export-btn pdf">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button @click="exportReport('users', 'word')" class="export-btn word">
          <i class="fas fa-file-word"></i> Word
        </button>
      </div>
      
      <div v-if="postReports" class="export-buttons">
        <button @click="exportReport('posts', 'pdf')" class="export-btn pdf">
          <i class="fas fa-file-pdf"></i> PDF
        </button>
        <button @click="exportReport('posts', 'word')" class="export-btn word">
          <i class="fas fa-file-word"></i> Word
        </button>
      </div>
    </div>

    <div v-if="isLoadingReports" class="loading-reports">
      <i class="fas fa-spinner fa-spin"></i> Генерация отчетов...
    </div>

    <div v-if="userReports" class="report-section">
      <h3 class="report-title">
        <i class="fas fa-users"></i> Отчет по участникам
      </h3>
      <div class="report-period">
        <i class="fas fa-calendar-alt"></i> {{ userReports.period }}
      </div>
      
      <div class="report-stats">
        <div class="stat-card">
          <h4>Активных участников</h4>
          <p class="stat-value">{{ userReports.activeUsersCount }}</p>
        </div>
        <div class="stat-card">
          <h4>Средний рейтинг</h4>
          <p class="stat-value">{{ userReports.averageUserRating }}</p>
        </div>
      </div>

      <h4 class="table-title">
        <i class="fas fa-trophy"></i> Самые активные участники
      </h4>
      <div class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Кол-во публикаций</th>
              <th>Средний рейтинг</th>
              <th>Всего просмотров</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userReports.mostActiveUsers" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.posts_count }}</td>
              <td>{{ user.avg_rating }}</td>
              <td>{{ user.total_views }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="postReports" class="report-section">
      <h3 class="report-title">
        <i class="fas fa-book"></i> Отчет по публикациям
      </h3>
      <div class="report-period">
        <i class="fas fa-calendar-alt"></i> {{ postReports.period }}
      </div>
      
      <div class="report-stats">
        <div class="stat-card">
          <h4>Всего просмотров</h4>
          <p class="stat-value">{{ postReports.totalViews }}</p>
        </div>
        <div class="stat-card">
          <h4>Средний рейтинг</h4>
          <p class="stat-value">{{ postReports.averagePostRating }}</p>
        </div>
      </div>

      <h4 class="table-title">
        <i class="fas fa-fire"></i> Самые популярные публикации
      </h4>
      <div class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Автор</th>
              <th>Просмотры</th>
              <th>Рейтинг</th>
              <th>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in postReports.popularPosts" :key="post.id">
              <td>{{ post.id }}</td>
              <td>{{ post.title }}</td>
              <td>{{ post.author }}</td>
              <td>{{ post.views }}</td>
              <td>{{ post.rating }}</td>
              <td>{{ formatDate(post.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminReportsTab',
  data() {
    const today = new Date().toISOString().split('T')[0];
    return {
      userReports: null,
      postReports: null,
      isLoadingReports: false,
      selectedPeriod: '',
      startDate: today,
      endDate: today,
      today
    };
  },
  methods: {
    handlePeriodChange() {
      if (this.selectedPeriod !== 'custom') {
        this.startDate = this.today;
        this.endDate = this.today;
      }
    },
    async generateUserReports() {
      this.isLoadingReports = true;
      try {
        const params = {
          period: this.selectedPeriod || undefined,
          startDate: this.selectedPeriod === 'custom' ? this.startDate : undefined,
          endDate: this.selectedPeriod === 'custom' ? this.endDate : undefined
        };
        
        const res = await axios.get('/api/reports/users', {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        this.userReports = res.data;
        this.postReports = null;
        this.$emit('show-message', 'Отчет по участникам успешно сгенерирован');
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка при генерации отчета по участникам', true);
      } finally {
        this.isLoadingReports = false;
      }
    },
    async generatePostReports() {
      this.isLoadingReports = true;
      try {
        const params = {
          period: this.selectedPeriod || undefined,
          startDate: this.selectedPeriod === 'custom' ? this.startDate : undefined,
          endDate: this.selectedPeriod === 'custom' ? this.endDate : undefined
        };
        
        const res = await axios.get('/api/reports/posts', {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        this.postReports = res.data;
        this.userReports = null;
        this.$emit('show-message', 'Отчет по публикациям успешно сгенерирован');
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка при генерации отчета по публикациям', true);
      } finally {
        this.isLoadingReports = false;
      }
    },
    async exportReport(type, format) {
      try {
        const params = {
          period: this.selectedPeriod || undefined,
          startDate: this.selectedPeriod === 'custom' ? this.startDate : undefined,
          endDate: this.selectedPeriod === 'custom' ? this.endDate : undefined
        };
        
        const response = await axios.get(`/api/reports/export/${type}/${format}`, {
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        const dateSuffix = this.selectedPeriod === 'custom' 
          ? `${this.startDate}_to_${this.endDate}`
          : new Date().toISOString().slice(0,10);
        
        const periodPrefix = this.selectedPeriod 
          ? `${this.selectedPeriod}_` 
          : 'all_time_';
        
        if (format === 'pdf') {
          link.setAttribute('download', `${type}_report_${periodPrefix}${dateSuffix}.pdf`);
        } else {
          link.setAttribute('download', `${type}_report_${periodPrefix}${dateSuffix}.docx`);
        }
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        this.$emit('show-message', `Отчет успешно экспортирован в ${format.toUpperCase()}`);
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка при экспорте отчета', true);
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    }
  }
};
</script>

<style scoped>
.admin-reports {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.report-controls {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.period-selector {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.period-selector label {
  font-weight: 500;
  color: #4a5568;
}

.period-select {
  padding: 10px 15px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 1em;
  max-width: 300px;
  background-color: #f8fafc;
  transition: border-color 0.3s;
}

.period-select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.custom-period {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.date-input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  transition: border-color 0.3s;
}

.date-input:focus {
  outline: none;
  border-color: #4299e1;
}

.date-separator {
  color: #718096;
  font-size: 0.9em;
}

.report-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.report-btn {
  padding: 10px 20px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-btn:hover {
  background-color: #3182ce;
}

.report-btn i {
  font-size: 1.1em;
}

.loading-reports {
  padding: 20px;
  text-align: center;
  color: #4a5568;
  font-style: italic;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.loading-reports i {
  font-size: 1.2em;
}

.report-section {
  margin-top: 30px;
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.report-title {
  color: #2d3748;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-title i {
  color: #4299e1;
}

.report-period {
  color: #718096;
  margin-bottom: 20px;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-period i {
  color: #a0aec0;
}

.report-stats {
  display: flex;
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  flex: 1;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #4299e1;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  color: #4a5568;
  font-size: 1em;
  font-weight: 500;
}

.stat-value {
  margin: 0;
  font-size: 1.8em;
  font-weight: bold;
  color: #2d3748;
}

.table-title {
  color: #2d3748;
  margin: 25px 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-title i {
  color: #e53e3e;
}

.table-responsive {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  margin-top: 15px;
  border-collapse: collapse;
  font-size: 0.95em;
}

.report-table th, .report-table td {
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.report-table th {
  background-color: #4299e1;
  color: white;
  font-weight: 500;
}

.report-table tr:nth-child(even) {
  background-color: #f8fafc;
}

.report-table tr:hover {
  background-color: #ebf8ff;
}

.export-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.export-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: opacity 0.3s;
}

.export-btn.pdf {
  background-color: #e53e3e;
}

.export-btn.word {
  background-color: #2b6cb0;
}

.export-btn:hover {
  opacity: 0.9;
}

.export-btn i {
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .report-buttons {
    flex-direction: column;
  }
  
  .report-stats {
    flex-direction: column;
  }
  
  .period-select {
    max-width: 100%;
  }
  
  .custom-period {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>