// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-05-07",
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/icon'],
  vite: {
    server: {
      allowedHosts: ['devserver-deploy-netlify-supabase--pegonku.netlify.app']
    }
  }
})