import axios, { AxiosError } from 'axios'
import type { ApiResponse } from '../types'
import { storage } from '../lib/storage'

const baseURL = import.meta.env.VITE_API_BASE_URL as string

export const apiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT to every request.
apiClient.interceptors.request.use((config) => {
  const token = storage.getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors to a real Error carrying the backend message.
// On 401, clear the session and bounce to /login.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      storage.clear()
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  },
)

// Small helper so callers get the unwrapped `data` directly.
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise
  return res.data.data
}
