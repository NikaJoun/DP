<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Загрузка аватара</h3>
        <button class="modal-close" @click="close">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="modal-body">
        <p v-if="error" class="error-message">{{ error }}</p>
        <p>Выберите изображение в формате JPG, PNG или GIF.</p>
        <p>Макс. размер файла: 2MB. Рекомендуемый размер: 200x200 пикс.</p>

        <div class="file-upload-area" @click="$refs.fileInput.click()">
          <i class="bi bi-cloud-upload"></i>
          <p>Нажмите для выбора файла</p>
          <input 
            type="file" 
            ref="fileInput"
            style="display: none"
            accept="image/*"
            @change="handleFileSelect"
          >
          <p v-if="selectedFile" class="file-name">{{ selectedFile.name }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="close">Отмена</button>
          <button 
            class="btn-confirm" 
            @click="upload" 
            :disabled="!selectedFile || uploading"
          >
            <span v-if="uploading">Загрузка...</span>
            <span v-else>Загрузить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: Boolean
  },
  data() {
    return {
      selectedFile: null,
      error: '',
      uploading: false
    };
  },
  methods: {
    close() {
      this.selectedFile = null;
      this.error = '';
      this.$emit('close');
    },
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        this.error = 'Неверный формат. Разрешены JPG, PNG, GIF.';
        this.selectedFile = null;
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.error = 'Файл слишком большой. Максимум 2MB.';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.error = '';
    },
    async upload() {
      if (!this.selectedFile) return;

      this.uploading = true;

      try {
        const formData = new FormData();
        formData.append('avatar', this.selectedFile);

        await this.$emit('upload', formData);
        this.close();
      } catch (err) {
        this.error = err.message || 'Ошибка загрузки';
      } finally {
        this.uploading = false;
      }
    }
  },
  watch: {
    show(val) {
      if (!val) {
        this.selectedFile = null;
        this.error = '';
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 2rem;
  max-width: 420px;
  width: 100%;
  color: #fff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.2);
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(16px);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-close:hover {
  color: #fff;
}

.modal-body {
  font-size: 0.95rem;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  color: #ff6b6b;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.file-upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem 1rem;
  text-align: center;
  margin: 1.5rem 0;
  cursor: pointer;
  transition: 0.2s;
}

.file-upload-area:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.file-upload-area i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #cbd5e1;
}

.file-upload-area p {
  margin: 0.3rem 0;
}

.file-name {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: #ddd;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel,
.btn-confirm {
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  font-size: 0.95rem;
  border: none;
  border-radius: 8px;
  transition: 0.2s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #eee;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-confirm {
  background-color: #2563eb;
  color: white;
}

.btn-confirm:hover {
  background-color: #1e40af;
}

.btn-confirm:disabled {
  background-color: #3b82f6;
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .modal-content {
    margin: 0 1rem;
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>
