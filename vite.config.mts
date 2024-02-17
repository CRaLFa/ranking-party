import { defineConfig } from 'npm:vite@^5.0.10'
import vue from 'npm:@vitejs/plugin-vue@^4.5.2'
import vuetify from 'npm:vite-plugin-vuetify'

import 'npm:vue@^3.3.13'
import 'npm:sass-loader'
import 'npm:sass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      styles: {
        configFile: './src/styles/settings.scss',
      },
    }),
  ],
})
