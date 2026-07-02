export const queryKeys = {
  subjects: ['subjects'] as const,
  topics: (subjectId: string) => ['topics', subjectId] as const,
  subTopics: (topicIds: string[]) => ['sub-topics', ...topicIds] as const,
  tests: ['tests'] as const,
  test: (id: string) => ['test', id] as const,
  questions: (ids: string[]) => ['questions', ...ids] as const,
}
