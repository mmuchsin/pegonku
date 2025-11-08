// composables/useGuideStatus.ts
export const useGuideStatus = () => {
  const hasReadGuide = useCookie('hasReadGuide', { 
    default: () => false,
    maxAge: 60 * 60 * 24 * 365 * 1,
  })
  
  const markGuideAsRead = () => {
    hasReadGuide.value = true
  }
  
  return {
    hasReadGuide,
    markGuideAsRead
  }
}