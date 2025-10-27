// middleware/guide-check.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { hasReadGuide } = useGuideStatus()
  
  if (!hasReadGuide.value && to.path !== '/panduan') {
    return navigateTo('/panduan')
  }
})
