import { useMutation, useQuery } from '@tanstack/react-query'
import { bulkCreateQuestions, fetchBulkQuestions } from '../api/questions'
import type { Question } from '../types'
import { queryKeys } from './queryKeys'

export function useQuestionsByIds(ids: string[]) {
  return useQuery({
    queryKey: queryKeys.questions(ids),
    queryFn: () => fetchBulkQuestions(ids),
    enabled: ids.length > 0,
  })
}

export function useBulkCreateQuestions() {
  return useMutation({
    mutationFn: (questions: Question[]) => bulkCreateQuestions(questions),
  })
}
