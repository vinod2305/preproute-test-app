import { apiClient, unwrap } from './axiosClient'
import type { ApiResponse, Subject, Topic, SubTopic } from '../types'

export function getSubjects() {
  return unwrap<Subject[]>(apiClient.get<ApiResponse<Subject[]>>('/subjects'))
}

export function getTopicsBySubject(subjectId: string) {
  return unwrap<Topic[]>(
    apiClient.get<ApiResponse<Topic[]>>(`/topics/subject/${subjectId}`),
  )
}

export function getSubTopicsByTopics(topicIds: string[]) {
  return unwrap<SubTopic[]>(
    apiClient.post<ApiResponse<SubTopic[]>>('/sub-topics/multi-topics', { topicIds }),
  )
}
