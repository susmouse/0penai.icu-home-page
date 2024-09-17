import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import { gsap } from 'gsap'

const app = createApp(App)
app.use(ElementPlus)
app.config.globalProperties.$gsap = gsap
app.mount('#app')