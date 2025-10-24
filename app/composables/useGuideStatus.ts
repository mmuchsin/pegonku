// composables/useGuideStatus.ts
export const useGuideStatus = () => {
  const hasReadGuide = useCookie('hasReadGuide', { 
    default: () => false 
  })
  
  const markGuideAsRead = () => {
    hasReadGuide.value = true
  }
  
  return {
    hasReadGuide,
    markGuideAsRead
  }
}