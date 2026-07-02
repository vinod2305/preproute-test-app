import { apiClient, unwrap } from './axiosClient'
import type { ApiResponse, LoginResponse } from '../types'

export function login(userId: string, password: string) {
  return unwrap<LoginResponse>(
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { userId, password }),
  )
}
