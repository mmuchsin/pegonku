// middleware/guide-check.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const hasRead = localStorage.getItem('hasReadGuide') === 'true'
    
    // Allow access to the guide page itself
    if (to.path === '/panduan') return
    
    // Redirect all other pages if guide not read
    if (!hasRead) {
      return navigateTo('/panduan')
    }
  }
})
