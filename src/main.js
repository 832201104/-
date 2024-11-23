import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '@/router/index'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)

app.use(router).use(store).use(ElementPlus, { locale: zhCn }).mount('#app')
