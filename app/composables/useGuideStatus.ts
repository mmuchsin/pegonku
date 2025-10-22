// composables/useGuideStatus.ts
export const useGuideStatus = () => {
  const hasReadGuide = () => {
    if (process.client) {
      return localStorage.getItem('hasReadGuide') === 'true'
    }
    return false
  }

  const markGuideAsRead = () => {
    if (process.client) {
      localStorage.setItem('hasReadGuide', 'true')
    }
  }

  return {
    hasReadGuide,
    markGuideAsRead
  }
}
