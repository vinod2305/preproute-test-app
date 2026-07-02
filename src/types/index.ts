// ---- API envelope ----
// The backend wraps every response as { status, message, data }.
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T
  errors?: unknown
}

// ---- Auth ----
export interface User {
  id: string
  userId: string
  name: string
  role: string
  subrole?: string | null
  phone?: string
  [key: string]: unknown
}

export interface LoginResponse {
  token: string
  user: User
}

// ---- Taxonomy ----
export interface Subject {
  id: string
  name: string
}

export interface Topic {
  id: string
  name: string
  subject_id: string
}

export interface SubTopic {
  id: string
  name: string
  topic_id: string
}

// ---- Tests ----
export type TestStatus = 'draft' | 'live' | null
export type Difficulty = 'easy' | 'medium' | 'hard'
export type TestType = 'chapterwise' | 'full_syllabus' | 'previous_year'

// Shape returned by GET /tests and GET /tests/:id.
// Note: subject/topics/sub_topics come back as display NAMES, not ids.
export interface Test {
  id: string
  name: string
  type: TestType | string
  subject: string
  topics: string[] | null
  sub_topics: string[] | null
  questions: string[] | null
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: Difficulty | string
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
  created_at: string
  updated_at: string | null
}

// Payload for POST /tests — subject/topics/sub_topics are UUIDs here.
export interface CreateTestPayload {
  name: string
  type: string
  subject: string
  topics: string[]
  sub_topics: string[]
  correct_marks: number
  wrong_marks: number
  unattempt_marks: number
  difficulty: string
  total_time: number
  total_marks: number
  total_questions: number
  status: TestStatus
}

export interface UpdateTestPayload {
  name?: string
  questions?: string[]
  total_questions?: number
  total_marks?: number
  status?: TestStatus
}

// ---- Questions ----
export type CorrectOption = 'option1' | 'option2' | 'option3' | 'option4'

export interface Question {
  id?: string
  type: 'mcq'
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct_option: CorrectOption
  explanation?: string
  difficulty?: string
  subject?: string // subject UUID — required by POST /questions/bulk
  topic?: string | null
  sub_topic?: string | null
  media_url?: string | null
  test_id?: string
}
