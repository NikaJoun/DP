<template>
  <div class="editor-wrapper">
    <div class="editor-header">
      <h1>{{ headerTitle }}</h1>
      <div class="header-actions">
        <button @click="cancelEditing" class="btn-cancel">
          <i class="bi bi-arrow-left"></i> Назад
        </button>
        <button @click="handleSubmit" class="btn-publish">
          {{ submitButtonText }}
        </button>
      </div>
    </div>

    <div class="editor-container">
      <div class="editor-meta">
        <div class="form-field">
          <label>Заголовок</label>
          <input
            v-model="title"
            type="text"
            required
            :placeholder="task ? 'Заголовок решения' : 'Заголовок публикации'"
            class="title-input"
          />
        </div>

        <div class="form-field image-uploader">
          <label>Обложка</label>
          <div class="upload-area" @click="triggerFileInput">
            <div v-if="!coverImagePreview" class="upload-placeholder">
              <i class="bi bi-image"></i>
              <span>Нажмите для загрузки</span>
              <p class="upload-hint">JPG или PNG, до 5MB</p>
            </div>
            <div v-else class="cover-preview">
              <img :src="coverImagePreview" alt="Предпросмотр обложки">
              <button @click.stop="removeCoverImage" class="remove-cover-btn">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleCoverImage"
              class="cover-image-input"
              style="display: none;"
            >
          </div>
        </div>

        <div class="publish-options" v-if="!task && !isEditMode">
          <label>Статус публикации</label>
          <div class="options-group">
            <div class="option-toggle">
              <button
                @click="postType = 'publish'"
                :class="{ active: postType === 'publish' }"
                class="toggle-btn"
              >
                <i class="bi bi-globe"></i> Опубликовать
              </button>
              <button
                @click="postType = 'draft'"
                :class="{ active: postType === 'draft' }"
                class="toggle-btn"
              >
                <i class="bi bi-file-earmark"></i> Черновик
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="editor-content">
        <div v-if="task" class="task-info">
          <h3><i class="bi bi-journal-text"></i> Задание</h3>
          <div class="task-meta">
            <span v-if="task.release_date" class="task-deadline">
              <i class="bi bi-calendar3"></i> Доступно с: {{ formatDate(task.release_date) }}
            </span>
          </div>
          <div class="task-description">
            <h4><i class="bi bi-list-task"></i> Требования:</h4>
            <div class="instructions-content">
              <p v-for="(line, idx) in splitInstructions(task.instructions)" :key="idx">{{ line }}</p>
            </div>
          </div>
        </div>
        <div class="text-editor">
          <div id="editor" ref="editor"></div>
        </div>

        <div v-if="message" class="status-message" :class="messageType">
          <i :class="messageIcon"></i>
          <span>{{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Quill from 'quill';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
  name: 'PostEditor',
  data() {
    return {
      title: '',
      content: '',
      message: '',
      isEditMode: false,
      postId: null,
      task: null,
      eventId: null,
      editor: null,
      postType: 'publish',
      coverImage: null,
      coverImagePreview: null,
      coverImageChanged: false,
      existingCoverImage: null
    };
  },
  computed: {
    messageType() {
      return this.message.includes('Ошибка') ? 'error' : 'success';
    },
    headerTitle() {
      if (this.isEditMode) return 'Редактирование публикации';
      return this.task ? 'Решение задания' : 'Новая публикация';
    },
    submitButtonText() {
      if (this.isEditMode) return 'Сохранить изменения';
      return this.task ? 'Решить' : 'Опубликовать';
    }
  },
  async created() {
    const taskId = this.$route.query.taskId;
    const postId = this.$route.query.postId;
    this.eventId = this.$route.query.eventId;

    if (postId) {
      this.isEditMode = true;
      await this.fetchPost(postId);
    } else if (taskId) {
      await this.fetchTask(taskId);
    }
  },
  mounted() {
    this.initEditor();
  },
  methods: {
    initEditor() {
      this.editor = new Quill(this.$refs.editor, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['blockquote'],
            ['code-block'],
          ]
        },
        placeholder: this.task 
          ? 'Опишите ваше решение задания...' 
          : 'Начните писать ваш текст здесь...'
      });
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    splitInstructions(text) {
      return text ? text.split('\n').filter(line => line.trim()) : [];
    },
    formatDate(dateString) {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: ru });
    },
    async fetchTask(taskId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/events/${this.eventId}/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.task = response.data;
      } catch (error) {
        this.message = 'Не удалось загрузить задание';
        console.error(error);
      }
    },
    async fetchPost(postId) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const post = response.data;
        this.title = post.title;
        this.editor.root.innerHTML = post.content;
        this.postId = post.id;
        
        if (post.cover_image) {
          this.coverImagePreview = post.cover_image;
          this.existingCoverImage = post.cover_image;
        }
        
        if (post.task_id) {
          await this.fetchTask(post.task_id);
        }
      } catch (error) {
        this.message = 'Ошибка при загрузке публикации';
      }
    },
    handleCoverImage(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          this.message = 'Размер изображения не должен превышать 5MB';
          event.target.value = '';
          return;
        }
        
        this.coverImage = file;
        this.coverImagePreview = URL.createObjectURL(file);
        this.coverImageChanged = true;
      }
    },
    removeCoverImage() {
      this.coverImage = null;
      this.coverImagePreview = null;
      this.coverImageChanged = true;
        
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    async handleSubmit() {
      if (!this.validateForm()) return;

      try {
        let coverImageUrl = this.existingCoverImage;
        
        if (this.coverImage) {
          const formData = new FormData();
          formData.append('cover', this.coverImage);
          
          const uploadResponse = await axios.post('/api/cover/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          coverImageUrl = uploadResponse.data.coverUrl;
        } 
        else if (this.coverImageChanged && !this.coverImage) {
          if (this.existingCoverImage) {
            const filename = this.existingCoverImage.split('/').pop();
            await axios.delete(`/api/cover/${filename}`, {
              headers: { 
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          }
          coverImageUrl = null;
        }

        const status = this.postType === 'publish' ? 'published' : 'draft';

        const postData = {
          title: this.title,
          content: this.editor.root.innerHTML,
          status,
          taskId: this.task?.id || null,
          coverImage: coverImageUrl
        };

        const response = await this.savePost(postData);
        this.handleSuccess(response);
      } catch (error) {
        this.handleError(error);
      }
    },
    validateForm() {
      if (!this.title.trim()) {
        this.message = 'Пожалуйста, укажите заголовок';
        return false;
      }
      
      const content = this.editor.root.innerHTML;
      if (!content || content === '<p><br></p>') {
        this.message = 'Пожалуйста, напишите содержание публикации';
        return false;
      }
      
      return true;
    },
    async savePost(postData) {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Требуется авторизация');

      if (this.isEditMode) {
        const response = await axios.put(
          `/api/posts/${this.postId}`,
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return { ...response, data: { ...response.data, postId: this.postId } };
      } else {
        return await axios.post(
          '/api/posts',
          postData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    },
    handleSuccess(response) {
      if (response.data.message) {
        this.message = this.getSuccessMessage();
        setTimeout(() => {
          this.$router.push(`/post/${response.data.postId}`);
        }, 1500);
      } else {
        this.message = 'Неизвестная ошибка при сохранении';
      }
    },
    getSuccessMessage() {
      if (this.isEditMode) return 'Публикация успешно обновлена';
      
      if (this.task) return 'Решение успешно опубликовано!';
      if (this.postType === 'draft') return 'Публикация сохранена как черновик!';
      return 'Публикация успешно опубликована!';
    },
    handleError(error) {
      this.message = error.response?.data?.error || 
                   error.message || 
                   'Произошла ошибка при сохранении';
      console.error(error);
    },
    cancelEditing() {
      if (this.postId) {
        this.$router.push(`/post/${this.postId}`);
      } else if (this.task && this.eventId) {
        this.$router.push(`/event-task/${this.eventId}`);
      } else {
        this.$router.push('/posts');
      }
    }
  }
};
</script>

<style scoped>
.editor-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}

.editor-header h1 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.editor-container {
  display: flex;
  gap: 24px;
}

.editor-meta {
  width: 280px;
  flex-shrink: 0;
}

.editor-content {
  flex: 1;
  min-width: 0;
}

.form-field {
  margin-bottom: 20px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.title-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.title-input:focus {
  outline: none;
  border-color: #4d90fe;
  box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.2);
}

.image-uploader {
  position: relative;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #bbb;
  background-color: #f5f5f5;
}

.upload-placeholder {
  color: #777;
}

.upload-placeholder i {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 13px;
  color: #999;
  margin-top: 8px;
}

.cover-preview {
  position: relative;
  border-radius: 6px;
  /* overflow: hidden; */
}

.cover-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.cover-image-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  /* overflow: hidden; */
}

.remove-cover-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.remove-cover-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}

.publish-options label {
  display: block;
  margin-bottom: 8px;
}

.option-toggle {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  /* overflow: hidden; */
  font-size: 12px;
}

.toggle-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.toggle-btn:first-child {
  border-right: 1px solid #ddd;
}

.toggle-btn.active {
  background: #f0f7ff;
  color: #1a73e8;
}

.toggle-btn:hover:not(.active) {
  background: #f5f5f5;
}

.task-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.task-info h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.task-deadline {
  color: #7f8c8d;
}

.task-description h4 {
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-description p {
  margin: 0;
  color: #555;
  line-height: 1.5;
}

.text-editor {
  border: 1px solid #ddd;
  border-radius: 8px;
  /* overflow: hidden; */
  background: white;
}

.status-message {
  padding: 12px 16px;
  border-radius: 6px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.status-message.success {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-message.error {
  background: #ffebee;
  color: #c62828;
}

.btn-publish, .btn-cancel {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-publish {
  background: #4d90fe;
  color: white;
  border: none;
}

.btn-publish:hover {
  background: #357ae8;
}

.btn-cancel {
  background: white;
  color: #555;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #f5f5f5;
}

/* Стили для Quill */
:deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #ddd;
  padding: 8px;
  background: white;
}

:deep(.ql-container) {
  border: none;
  font-size: 15px;
  background: white;
}

:deep(.ql-editor) {
  min-height: 300px;
  padding: 16px;
  background: white;
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  .editor-meta {
    width: 100%;
  }
  
  .header-actions {
    flex-direction: column-reverse;
    width: 100%;
  }
  
  .btn-publish, .btn-cancel {
    width: 100%;
    justify-content: center;
  }
  
  .option-toggle {
    flex-direction: column;
  }
  
  .toggle-btn:first-child {
    border-right: none;
    border-bottom: 1px solid #ddd;
  }
}
</style>