import { createApp } from 'vue'
import { createPinia } from 'pinia'

import './assets/global.css'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'quill/dist/quill.snow.css'

createApp(App).use(createPinia()).use(router).mount('#app')
