import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  publishTest,
} from '../api/tests'
import type { CreateTestPayload, UpdateTestPayload } from '../types'
import { queryKeys } from './queryKeys'

export function useTests() {
  return useQuery({ queryKey: queryKeys.tests, queryFn: getTests })
}

export function useTest(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.test(id ?? ''),
    queryFn: () => getTest(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateTest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTestPayload) => createTest(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tests }),
  })
}

export function useUpdateTest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: UpdateTestPayload | CreateTestPayload
    }) => updateTest(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.tests })
      qc.invalidateQueries({ queryKey: queryKeys.test(id) })
    },
  })
}

export function useDeleteTest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.tests }),
  })
}

export function usePublishTest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => publishTest(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.tests })
      qc.invalidateQueries({ queryKey: queryKeys.test(id) })
    },
  })
}
