<template>
  <div>
    <h2>Список пользователей</h2>
    
    <!-- Панель управления -->
    <div class="control-panel">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          placeholder="Поиск по имени" 
          class="search-input"
        >
      </div>
      
      <div class="filters">
        <select v-model="roleFilter" class="filter-select">
          <option value="">Все роли</option>
          <option value="admin">Админ</option>
          <option value="author">Пользователь</option>
        </select>
        
        <button 
          @click="toggleSortOrder" 
          class="sort-btn"
        >
          Сортировать по дате {{ sortAsc ? '↑' : '↓' }}
        </button>
      </div>
    </div>
    
    <!-- Таблица пользователей -->
    <table v-if="filteredUsers.length" class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Телефон</th>
          <th @click="toggleSortOrder" class="sortable-header">
            Дата регистрации {{ sortAsc ? '↑' : '↓' }}
          </th>
          <th>Роль</th>
          <th>Изменить роль</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td>{{ getRoleName(user.role) }}</td>
          <td>
            <select v-model="user.newRoleId" class="role-select">
              <option :value="1">Админ</option>
              <option :value="2">Пользователь</option>
            </select>
            <button @click="updateUserRole(user.id, user.newRoleId)" class="update-btn">
              Изменить
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет пользователей для отображения</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminUsersTab',
  data() {
    return {
      users: [],
      searchQuery: '',
      roleFilter: '',
      sortAsc: false,
    };
  },
  computed: {
    filteredUsers() {
      let result = [...this.users];
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(user => 
          user.username.toLowerCase().includes(query)
        );
      }
      
      if (this.roleFilter) {
        result = result.filter(user => 
          typeof user.role === 'string' 
            ? user.role === this.roleFilter
            : this.getRoleNameById(user.role).toLowerCase() === this.roleFilter
        );
      }
      
      result.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return this.sortAsc ? dateA - dateB : dateB - dateA;
      });
      
      return result;
    }
  },
  created() {
    this.fetchUsers();
  },
  methods: {
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.users = res.data.map(user => ({
          ...user,
          newRoleId: user.roleId
        }));
      } catch (err) {
        console.error(err);
        this.$emit('show-message', 'Ошибка получения пользователей', true);
      }
    },
    
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString('ru-RU', options);
    },
    
    getRoleName(role) {
      if (typeof role === 'string') {
        const roles = {
          'admin': 'Админ',
          'author': 'Пользователь'
        };
        return roles[role] || 'Неизвестная роль';
      }
      return this.getRoleNameById(role);
    },
    
    getRoleNameById(roleId) {
      const roles = {
        1: 'Админ',
        2: 'Пользователь'
      };
      return roles[roleId] || 'Неизвестная роль';
    },
    
    toggleSortOrder() {
      this.sortAsc = !this.sortAsc;
    },
    
    async updateUserRole(userId, newRoleId) {
      if (!confirm('Вы уверены, что хотите изменить роль пользователя?')) return;
      
      try {
        const res = await axios.post('/api/update-role', 
          { userId, roleId: newRoleId },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        
        if (res.data.success) {
          this.$emit('show-message', res.data.message);
          const userIndex = this.users.findIndex(u => u.id === userId);
          if (userIndex !== -1) {
            this.users[userIndex] = { 
              ...this.users[userIndex],
              roleId: res.data.user.roleId,
              role: res.data.user.role,
              newRoleId: res.data.user.roleId
            };
          }
        } else {
          this.$emit('show-message', res.data.message, true);
        }
      } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || 'Ошибка обновления роли';
        this.$emit('show-message', errorMsg, true);
      }
    }
  }
};
</script>

<style scoped>
.control-panel {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filters {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.sort-btn {
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.sort-btn:hover {
  background-color: #2980b9;
}

.users-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.users-table th, .users-table td {
  padding: 12px 15px;
  border: 1px solid #ddd;
  text-align: left;
}

.users-table th {
  background-color: #3498db;
  color: white;
}

.sortable-header {
  cursor: pointer;
}

.sortable-header:hover {
  background-color: #2980b9;
}

.users-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.users-table tr:hover {
  background-color: #e6f7ff;
}

.role-select {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-right: 10px;
}

.update-btn {
  padding: 6px 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.update-btn:hover {
  background-color: #27ae60;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }
  
  .search-box, .filters {
    width: 100%;
  }
}
</style>