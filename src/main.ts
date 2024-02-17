import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import vuetify from "./plugins/vuetify.ts"
import { loadFonts } from './plugins/webfontloader.ts'

loadFonts()

createApp(App)
  .use(vuetify)
  .mount('#app')
