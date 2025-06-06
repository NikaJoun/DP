<template>
  <div class="profile-container">
    <div class="sidebar">
      <UserProfileSidebar
        :user="user"
        :followers-count="followersCount"
        :subscriptions-count="subscriptionsCount"
        :is-subscribed="isSubscribed"
        :is-own-profile="isOwnProfile"
        :formatted-join-date="formattedJoinDate"
        @toggle-subscribe="handleToggleSubscribe"
        @open-followers="showFollowersModal = true"
        @open-subscriptions="showSubscriptionsModal = true"
      />
    </div>

    <div class="main-content">
      <UserAboutSection v-if="user?.about" :about="user.about" />
      
      <PostsSection 
        :posts="userPosts"
        :title="'Публикации'"
        :count="userPosts.length"
        empty-text="У пользователя пока нет опубликованных работ"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserProfileStore } from '@/stores/userProfileStore'
import { useAuthStore } from '@/stores/auth'
import UserProfileSidebar from '@/components/profile/UserProfileSidebar.vue'
import UserAboutSection from '@/components/profile/UserAboutSection.vue'
import PostsSection from '@/components/profile/PostsSection.vue'
import SubscriptionsModal from '@/components/profile/SubscriptionsModal.vue'

const route = useRoute()
const userProfileStore = useUserProfileStore()
const authStore = useAuthStore()

const showFollowersModal = ref(false)
const showSubscriptionsModal = ref(false)

const user = computed(() => userProfileStore.user)
const userPosts = computed(() => userProfileStore.userPosts)
const followersCount = computed(() => userProfileStore.followersCount)
const subscriptionsCount = computed(() => userProfileStore.subscriptionsCount)
const isSubscribed = computed(() => userProfileStore.isSubscribed)
const formattedJoinDate = computed(() => userProfileStore.formattedJoinDate)

const isOwnProfile = computed(() => {
  if (!authStore.user || !user.value) return false
  return authStore.user.id === user.value.id
})

async function loadData() {
  await userProfileStore.loadUserProfile(route.params.id)
  if (authStore.isAuthenticated && !isOwnProfile.value) {
    await userProfileStore.checkSubscription(route.params.id)
  }
}

async function handleToggleSubscribe() {
  try {
    await userProfileStore.toggleSubscription(route.params.id)
  } catch (error) {
    if (error.message.includes('Сессия истекла')) {
      authStore.logout()
    }
  }
}

onMounted(loadData)

watch(() => route.params.id, loadData)
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