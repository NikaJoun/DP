<template>
  <div class="profile-container">
    <div class="sidebar">
      <ProfileSidebar 
        :user="user"
        :followers-count="followersCount"
        :subscriptions-count="subscriptionsCount"
        @edit-avatar="showAvatarModal = true"
        @open-followers="showFollowersModal = true"
        @open-subscriptions="showSubscriptionsModal = true"
        @open-drafts="showDraftsModal = true"
        @open-edit-profile="showEditProfileModal = true"
        @logout="logout"
      />
    </div>

    <div class="main-content">
      <div class="about-section" v-if="user?.about">
        <h3>Обо мне</h3>
        <p>{{ user.about }}</p>
      </div>

      <div class="section-header">
        <h2>Мои публикации</h2>
      </div>

      <PostsList 
        v-if="publishedPosts.length"
        :posts="publishedPosts"
        @delete="deletePost"
      />
      <EmptyState v-else icon="bi-journal-text">
        У вас пока нет опубликованных работ
      </EmptyState>

      <AlertMessage v-if="message" type="error">
        {{ message }}
      </AlertMessage>
    </div>

    <DraftModal
      v-if="showDraftsModal"
      :posts="draftPosts"
      @close="showDraftsModal = false"
      @delete="deletePost"
    />

    <EditProfileModal
      v-if="showEditProfileModal"
      :user="user"
      @close="showEditProfileModal = false"
      @update="updateUserProfile"
    />

    <SubscriptionsModal
      v-if="showFollowersModal"
      title="Подписчики"
      :fetch-url="`/api/user/${user.id}/followers`"
      @close="showFollowersModal = false"
    />

    <SubscriptionsModal
      v-if="showSubscriptionsModal"
      title="Подписки"
      :fetch-url="`/api/user/${user.id}/subscriptions`"
      @close="showSubscriptionsModal = false"
    />

    <AvatarUploadModal
      :show="showAvatarModal"
      @close="showAvatarModal = false"
      @upload="uploadAvatar"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { usePostStore } from '@/stores/postStore'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import PostsList from '@/components/profile/PostsList.vue'
import EmptyState from '@/components/profile/EmptyState.vue'
import AlertMessage from '@/components/profile/AlertMessage.vue'
import DraftModal from '@/components/profile/DraftsModal.vue'
import EditProfileModal from '@/components/profile/EditProfileModal.vue'
import SubscriptionsModal from '@/components/profile/SubscriptionsModal.vue'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal.vue'

const userStore = useUserStore()
const postStore = usePostStore()
const router = useRouter()

const showDraftsModal = ref(false)
const showEditProfileModal = ref(false)
const showFollowersModal = ref(false)
const showSubscriptionsModal = ref(false)
const showAvatarModal = ref(false)

const user = computed(() => userStore.user)
const followersCount = computed(() => userStore.followersCount)
const subscriptionsCount = computed(() => userStore.subscriptionsCount)
const message = computed(() => userStore.message)
const publishedPosts = computed(() => postStore.publishedPosts)
const draftPosts = computed(() => postStore.draftPosts)

onMounted(async () => {
  try {
    const success = await userStore.fetchUserInfo()
    if (success) {
      await Promise.all([
        userStore.fetchUserStats(),
        postStore.fetchUserPosts()
      ])
    }
  } catch (error) {
    console.error('Failed to load profile data:', error)
  }
})

const logout = () => {
  userStore.logout()
  router.push('/login')
}

const deletePost = async (postId) => {
  if (!confirm('Вы уверены, что хотите удалить эту публикацию?')) return
  try {
    await postStore.deletePost(postId)
  } catch (error) {
    console.error('Error deleting post:', error)
  }
}

const updateUserProfile = async (updatedData) => {
  try {
    await userStore.updateProfile(updatedData)
  } catch (error) {
    console.error('Profile update error:', error)
  }
}

const uploadAvatar = async (formData) => {
  try {
    await userStore.uploadAvatar(formData)
  } catch (error) {
    console.error('Avatar upload error:', error)
  }
}
</script>

<style scoped>
.profile-container {
  display: flex;
  min-height: calc(100vh - 120px);
  max-width: 1200px;
  padding: 10px;
  margin: 0 auto;
  margin-top: 2rem;
  gap: 1.5rem;
}

.sidebar {
  width: 280px;
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.main-content {
  flex: 1;
}

.about-section {
  padding: 1.5rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  background-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.about-section h3 {
  font-size: 1.3rem;
}

.section-header {
  margin: 1.5rem 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header h2 {
  font-size: 1.3rem;
  color: #fff;
  margin: 0;
}

@media (max-width: 992px) {
  .profile-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    position: static;
    margin-bottom: 2rem;
  }
}

@media (max-width: 576px) {
  .profile-container {
    padding: 1rem;
  }
}
</style>