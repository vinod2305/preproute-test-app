import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { questionSchema } from '../lib/validation'
import type { QuestionForm } from '../lib/validation'
import type { CorrectOption, Question } from '../types'
import { useTest, useUpdateTest } from '../hooks/useTests'
import { useBulkCreateQuestions } from '../hooks/useQuestions'
import { useSubjects } from '../hooks/useTaxonomy'
import { idsFromNames } from '../lib/mappers'
import { DIFFICULTY_OPTIONS } from '../lib/constants'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { StatusBadge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/cn'

const OPTION_KEYS = ['option1', 'option2', 'option3', 'option4'] as const

const emptyQuestion: QuestionForm = {
  question: '',
  option1: '',
  option2: '',
  option3: '',
  option4: '',
  correct_option: 'option1',
  explanation: '',
  difficulty: 'medium',
  media_url: '',
}

export function QuestionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const { data: test, isLoading } = useTest(id)
  const { data: subjects } = useSubjects()
  const bulkCreate = useBulkCreateQuestions()
  const updateTest = useUpdateTest()

  const [items, setItems] = useState<QuestionForm[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: emptyQuestion,
  })

  const correctOption = watch('correct_option')

  function onAdd(values: QuestionForm) {
    if (editingIndex !== null) {
      setItems((prev) => prev.map((q, i) => (i === editingIndex ? values : q)))
      setEditingIndex(null)
    } else {
      setItems((prev) => [...prev, values])
    }
    reset(emptyQuestion)
  }

  function editItem(index: number) {
    reset(items[index])
    setEditingIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function deleteItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      reset(emptyQuestion)
    }
  }

  async function handleSaveAndContinue() {
    if (!id || !test) return
    if (items.length === 0) {
      notify('Add at least one question to continue', 'error')
      return
    }
    // The bulk endpoint requires the subject UUID, but the test carries the
    // subject as a display name — map it back via the subjects list.
    const subjectId = idsFromNames([test.subject], subjects ?? [])[0]
    if (!subjectId) {
      notify('Could not resolve the test subject. Please try again.', 'error')
      return
    }

    setSaving(true)
    try {
      const payload: Question[] = items.map((q) => ({
        type: 'mcq',
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        correct_option: q.correct_option,
        explanation: q.explanation || undefined,
        difficulty: q.difficulty || undefined,
        media_url: q.media_url || undefined,
        subject: subjectId,
        test_id: id,
      }))

      const created = await bulkCreate.mutateAsync(payload)
      const questionIds = created
        .map((q) => q.id)
        .filter((qid): qid is string => Boolean(qid))

      await updateTest.mutateAsync({
        id,
        payload: {
          questions: questionIds,
          total_questions: questionIds.length,
          total_marks: questionIds.length * test.correct_marks,
        },
      })

      notify('Questions saved', 'success')
      navigate(`/tests/${id}/preview`)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save questions', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <PageLoader label="Loading test…" />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/tests/${id}/edit`)}
          className="mb-3 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to test details
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">Add Questions</h1>
        <p className="mt-1 text-sm text-slate-500">Step 2 of 3 — Add MCQ questions</p>
      </div>

      {/* Test summary */}
      {test && (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-card">
          <div>
            <span className="text-slate-400">Test:</span>{' '}
            <span className="font-medium text-slate-900">{test.name}</span>
          </div>
          <div>
            <span className="text-slate-400">Subject:</span>{' '}
            <span className="text-slate-700">{test.subject}</span>
          </div>
          <div>
            <span className="text-slate-400">Correct marks:</span>{' '}
            <span className="text-slate-700">{test.correct_marks}</span>
          </div>
          <StatusBadge status={test.status} />
        </div>
      )}

      {/* Question form */}
      <form
        onSubmit={handleSubmit(onAdd)}
        className="mb-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {editingIndex !== null ? `Editing question ${editingIndex + 1}` : 'New question'}
          </h2>
        </div>

        <Textarea
          id="question"
          label="Question"
          placeholder="Enter the question text"
          error={errors.question?.message}
          {...register('question')}
        />

        <div className="space-y-2">
          <span className="label-base">Options (select the correct one)</span>
          {OPTION_KEYS.map((key, idx) => (
            <div key={key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setValue('correct_option', key as CorrectOption)}
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                  correctOption === key
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-slate-300 text-transparent',
                )}
                aria-label={`Mark option ${idx + 1} correct`}
              >
                ✓
              </button>
              <Input
                placeholder={`Option ${idx + 1}`}
                error={errors[key]?.message}
                {...register(key)}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select label="Difficulty" options={DIFFICULTY_OPTIONS} {...register('difficulty')} />
          <Input
            id="media_url"
            label="Media URL (optional)"
            placeholder="https://…"
            error={errors.media_url?.message}
            {...register('media_url')}
          />
        </div>

        <Textarea
          id="explanation"
          label="Explanation (optional)"
          placeholder="Explain the correct answer"
          {...register('explanation')}
        />

        <div className="flex justify-end gap-3">
          {editingIndex !== null && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingIndex(null)
                reset(emptyQuestion)
              }}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" variant="secondary">
            {editingIndex !== null ? 'Update Question' : '+ Add Question'}
          </Button>
        </div>
      </form>

      {/* Added questions list */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Added questions ({items.length})
        </h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
            No questions added yet. Add at least one to continue.
          </div>
        ) : (
          <ol className="space-y-3">
            {items.map((q, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {i + 1}. {q.question}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {OPTION_KEYS.map((key, idx) => (
                        <li
                          key={key}
                          className={cn(
                            'flex items-center gap-2',
                            q.correct_option === key
                              ? 'font-medium text-green-700'
                              : 'text-slate-600',
                          )}
                        >
                          <span className="text-slate-400">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {q[key]}
                          {q.correct_option === key && (
                            <span className="text-xs text-green-600">(correct)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => editItem(i)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => deleteItem(i)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAndContinue}
          loading={saving}
          disabled={items.length === 0}
        >
          Save &amp; Continue →
        </Button>
      </div>
    </div>
  )
}
