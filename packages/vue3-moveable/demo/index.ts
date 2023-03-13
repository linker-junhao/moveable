import { createPinia } from 'pinia'
import { createApp } from 'vue';
const pinia = createPinia()
import App from './App.vue';

const app = createApp(App)
app.use(pinia)
app.mount('#app')
