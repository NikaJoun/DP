import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import PostCreate from '../views/PostCreate.vue'
import PostsView from '../views/PostView.vue'
import PostPage from '../views/PostPage.vue'
import AdminPanel from '../views/AdminPanel.vue'
import NotFound from '../views/NotFound.vue';
import UserProfileView from '../views/UserProfileView.vue';
import EventCalendar from '@/views/EventCalendar.vue'
import ActiveEventsPage from '@/views/ActiveEventsPage.vue';

const ROLES = {
  ADMIN: 1,
  AUTHOR: 2
}

const routes = [
  { path: '/', component: HomeView, meta: { title: 'The Stars' }},
  { path: '/login', component: LoginView },
  { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/user/:id', component: UserProfileView, meta: { requiresAuth: false } },
  {
    path: '/create-post',
    component: PostCreate,
    meta: { requiresAuth: true },
    props: (route) => ({ 
      taskId: route.query.taskId,
      postId: route.query.postId,
      eventId: route.query.eventId
    })
  },
  { path: '/posts', component: PostsView },
  { path: '/post/:id', component: PostPage, name: 'PostPage' },
  { path: '/event-calendar', component: EventCalendar, meta: { requiresAuth: true } },
  {
    path: '/event-task/:id',
    component: ActiveEventsPage,
    name: 'EventTask',
    meta: { requiresAuth: true },
    props: (route) => ({ 
      taskId: route.query.taskId 
    })
  },
  { 
    path: '/admin', 
    component: AdminPanel, 
    meta: { 
      requiresAuth: true, 
      requiredRoleId: ROLES.ADMIN
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = 'The Stars';
  }

  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/login')
    }

    try {
      
      const decodedToken = jwtDecode(token)

      const now = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < now) {
        localStorage.removeItem('token')
        return next('/login')
      }

      if (typeof decodedToken.roleId === 'undefined') {
        return next('/login')
      }

      if (to.meta.requiredRoles) {
        if (!to.meta.requiredRoles.includes(decodedToken.roleId)) {
          return next('/')
        }
      }

      next()
    } catch (error) {
      console.error('[Router] Ошибка декодирования:', error)
      
      try {
        const payloadBase64 = token.split('.')[1]
        const payloadJson = atob(payloadBase64)
        const payload = JSON.parse(payloadJson)
        console.log('[Router] Ручной парсинг payload:', payload)
      } catch (parseError) {
        console.error('[Router] Ошибка ручного парсинга токена:', parseError)
      }
      
      return next('/login')
    }
  } else {
    next()
  }
})

export default router
