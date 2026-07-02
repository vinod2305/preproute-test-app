import { apiClient, unwrap } from './axiosClient'
import type {
  ApiResponse,
  Test,
  CreateTestPayload,
  UpdateTestPayload,
} from '../types'

export function getTests() {
  return unwrap<Test[]>(apiClient.get<ApiResponse<Test[]>>('/tests'))
}

export function getTest(id: string) {
  return unwrap<Test>(apiClient.get<ApiResponse<Test>>(`/tests/${id}`))
}

export function createTest(payload: CreateTestPayload) {
  return unwrap<Test>(apiClient.post<ApiResponse<Test>>('/tests', payload))
}

export function updateTest(id: string, payload: UpdateTestPayload | CreateTestPayload) {
  return unwrap<Test>(apiClient.put<ApiResponse<Test>>(`/tests/${id}`, payload))
}

export function deleteTest(id: string) {
  return unwrap<unknown>(apiClient.delete<ApiResponse<unknown>>(`/tests/${id}`))
}

export function publishTest(id: string) {
  return unwrap<Test>(
    apiClient.put<ApiResponse<Test>>(`/tests/${id}`, { status: 'live' }),
  )
}
