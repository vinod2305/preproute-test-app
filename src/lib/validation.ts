import { z } from 'zod'

export const loginSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  password: z.string().min(1, 'Password is required'),
})
export type LoginForm = z.infer<typeof loginSchema>

export const testSchema = z.object({
  name: z.string().min(1, 'Test name is required'),
  subject: z.string().min(1, 'Subject is required'),
  type: z.string().min(1, 'Test type is required'),
  topics: z.array(z.string()).min(1, 'Select at least one topic'),
  sub_topics: z.array(z.string()),
  difficulty: z.string().min(1, 'Difficulty is required'),
  correct_marks: z.number().min(0, 'Must be 0 or more'),
  wrong_marks: z.number(),
  unattempt_marks: z.number(),
  total_time: z.number().min(1, 'Total time is required'),
  total_marks: z.number().min(1, 'Total marks is required'),
  total_questions: z.number().min(1, 'Total questions is required'),
})
export type TestForm = z.infer<typeof testSchema>

export const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  option1: z.string().min(1, 'Option 1 is required'),
  option2: z.string().min(1, 'Option 2 is required'),
  option3: z.string().min(1, 'Option 3 is required'),
  option4: z.string().min(1, 'Option 4 is required'),
  correct_option: z.enum(['option1', 'option2', 'option3', 'option4']),
  explanation: z.string().optional(),
  difficulty: z.string().optional(),
  media_url: z
    .string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})
export type QuestionForm = z.infer<typeof questionSchema>
