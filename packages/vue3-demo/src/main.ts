import './assets/main.css'
import '../public/svg-sprite'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import symbolIcon from '@svgjs/vue-symbol-icon'

const app = createApp(App)

app.use(router)
app.use(symbolIcon, {
    name: 'a-icon',
    color: 'red'
});

app.mount('#app')

