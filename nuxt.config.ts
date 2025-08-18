// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  nitro: {
    middleware: [
      {
        route: '/api/**',
        override: true
      }
    ]
  }
})