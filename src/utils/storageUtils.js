/**
 * Utility functions for managing localStorage data
 */

/**
 * Clear all CivicLens related data from localStorage and sessionStorage
 */
export const clearAllAppData = () => {
  // Get all localStorage keys
  const localStorageKeys = Object.keys(localStorage)
  
  // Remove all onboarding and profile related keys
  const appKeys = localStorageKeys.filter(key => 
    key.startsWith('onboarding_') || 
    key.startsWith('profile_') ||
    key.includes('_basic_info') ||
    key.includes('_priority_issues') ||
    key.includes('_survey_responses') ||
    key.includes('_selected_contests') ||
    key.includes('_completed')
  )
  
  appKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Clear session storage
  sessionStorage.clear()
  
  console.log(`Cleared ${appKeys.length} localStorage items and all sessionStorage`)
  return appKeys.length
}

/**
 * Clear data for a specific session ID
 */
export const clearSessionData = (sessionId) => {
  if (!sessionId) return 0
  
  const localStorageKeys = Object.keys(localStorage)
  const sessionKeys = localStorageKeys.filter(key => key.includes(`_${sessionId}`))
  
  sessionKeys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  console.log(`Cleared ${sessionKeys.length} items for session ${sessionId}`)
  return sessionKeys.length
}

/**
 * Get all stored data for debugging
 */
export const getAllAppData = () => {
  const localStorageKeys = Object.keys(localStorage)
  const appKeys = localStorageKeys.filter(key => 
    key.startsWith('onboarding_') || 
    key.startsWith('profile_') ||
    key.includes('_basic_info') ||
    key.includes('_priority_issues') ||
    key.includes('_survey_responses') ||
    key.includes('_selected_contests') ||
    key.includes('_completed')
  )
  
  const data = {}
  appKeys.forEach(key => {
    try {
      data[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      data[key] = localStorage.getItem(key)
    }
  })
  
  return {
    localStorage: data,
    sessionStorage: {
      user_session_id: sessionStorage.getItem('user_session_id')
    }
  }
}
