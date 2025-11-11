import axios from 'axios'

// Get API URL from environment variable, fallback to localhost for development
export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000')
}

const API_BASE = getApiBaseUrl()

export function createClient(token) {
  const client = axios.create({ 
    baseURL: API_BASE,
    timeout: 30000 // 30 second timeout for file uploads
  })
  
  client.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message)
      }
      return Promise.reject(error)
    }
  )
  
  return client
}


