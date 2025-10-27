// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-05-07",
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    "@nuxt/icon",
    "@vueuse/nuxt",
    "@nuxtjs/google-fonts",
  ],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  googleFonts: {
    families: {
      'Scheherazade New': [400, 500, 600, 700]
    },
    display: 'swap'
  }
})