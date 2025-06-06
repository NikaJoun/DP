<template>
  <div class="search-section">
    <div class="search-input-container">
      <input
        type="text"
        v-model="searchQuery"
        class="form-control search-input"
        placeholder="Начните вводить свой запрос..."
        @keyup.enter="searchPosts"
      />
      <button class="search-button" @click="searchPosts">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
          viewBox="0 0 16 16">
          <path
            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

function searchPosts() {
  if (searchQuery.value.trim()) {
    router.push(`/posts?query=${searchQuery.value}`)
  }
}
</script>

<style scoped>
.search-input-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 50px 12px 20px;
  border-radius: 30px;
  border: 1px solid #ced4da;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
}

.search-input:focus {
  background: #fff;
  outline: none;
}

.search-button {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}
</style>