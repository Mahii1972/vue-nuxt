// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2025-01-08',
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    // Private keys that are exposed to the server
    databaseUrl: process.env.VITE_DATABASE_URL,
    // Public keys that are exposed to the client
    public: {
      apiBase: '/api'
    }
  },
  build: {
    transpile: ['v-calendar']
  }
})
