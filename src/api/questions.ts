import { apiClient, unwrap } from './axiosClient'
import type { ApiResponse, Question } from '../types'

export function bulkCreateQuestions(questions: Question[]) {
  return unwrap<Question[]>(
    apiClient.post<ApiResponse<Question[]>>('/questions/bulk', { questions }),
  )
}

export function fetchBulkQuestions(questionIds: string[]) {
  return unwrap<Question[]>(
    apiClient.post<ApiResponse<Question[]>>('/questions/fetchBulk', {
      question_ids: questionIds,
    }),
  )
}
