import { useQuery } from '@tanstack/react-query'
import { getSubjects, getTopicsBySubject, getSubTopicsByTopics } from '../api/taxonomy'
import { queryKeys } from './queryKeys'

export function useSubjects() {
  return useQuery({
    queryKey: queryKeys.subjects,
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTopics(subjectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.topics(subjectId ?? ''),
    queryFn: () => getTopicsBySubject(subjectId as string),
    enabled: Boolean(subjectId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSubTopics(topicIds: string[]) {
  return useQuery({
    queryKey: queryKeys.subTopics(topicIds),
    queryFn: () => getSubTopicsByTopics(topicIds),
    enabled: topicIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
