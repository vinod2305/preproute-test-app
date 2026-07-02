import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
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
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/cn'
import { Workspace, QuestionPanel } from '../components/layout/Workspace'
import { TrashIcon } from '../components/ui/icons'
import { TestSummaryCard } from '../components/TestSummaryCard'
import { RichTextEditor } from '../components/ui/RichTextEditor'

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
    control,
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
  }

  async function handleSaveAndContinue() {
    if (!id || !test) return
    if (items.length === 0) {
      notify('Add at least one question to continue', 'error')
      return
    }
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

  if (isLoading || !test) return <PageLoader label="Loading test…" />

  const panelItems = [
    ...items.map((_, i) => ({
      label: `Question ${i + 1}`,
      done: true,
      active: editingIndex === i,
      onClick: () => editItem(i),
    })),
    {
      label: `Question ${items.length + 1}`,
      done: false,
      active: editingIndex === null,
    },
  ]

  const currentNo = editingIndex !== null ? editingIndex + 1 : items.length + 1

  return (
    <Workspace panel={<QuestionPanel total={test.total_questions} items={panelItems} />}>
      {/* Breadcrumb + Publish */}
      <div className="mb-6 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <span>Test Creation</span>
          <span>/</span>
          <span>Create Test</span>
          <span>/</span>
          <span className="text-gray-700">Chapter Wise</span>
        </nav>
        <Button size="md" className="px-6" onClick={handleSaveAndContinue} loading={saving}>
          Publish
        </Button>
      </div>

      <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${id}/edit`)} />

      {/* Question editor header */}
      <div className="mb-3 mt-8 flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">
          Question {currentNo}
          <span className="text-gray-400">/{test.total_questions}</span>
        </h2>
        <div className="flex gap-2">
          <span className="rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700">
            + MCQ
          </span>
          <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400">
            ↥ CSV
          </span>
        </div>
      </div>

      {items.length > 0 && editingIndex === null && (
        <button
          className="mb-3 text-sm font-medium text-red-500 hover:underline"
          onClick={() => {
            setItems([])
            reset(emptyQuestion)
          }}
        >
          🗑 Delete All Edits
        </button>
      )}

      <form onSubmit={handleSubmit(onAdd)}>
        {/* Rich-text question editor */}
        <Controller
          name="question"
          control={control}
          render={({ field }) => (
            <RichTextEditor value={field.value} onChange={field.onChange} placeholder="Type here" />
          )}
        />
        {errors.question && (
          <p className="mt-1 text-xs text-red-600">{errors.question.message}</p>
        )}

        {/* Options */}
        <p className="mb-3 mt-6 text-sm font-medium text-gray-800">
          Type the options below
        </p>
        <div className="space-y-3">
          {OPTION_KEYS.map((key, idx) => (
            <div key={key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setValue('correct_option', key as CorrectOption)}
                aria-label={`Mark option ${idx + 1} correct`}
                className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                  correctOption === key ? 'border-primary-500' : 'border-gray-300',
                )}
              >
                {correctOption === key && (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                )}
              </button>
              <div className="relative flex-1">
                <input
                  {...register(key)}
                  placeholder="Type Option here"
                  className="input-base h-12 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setValue(key, '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {(errors.option1 || errors.option2 || errors.option3 || errors.option4) && (
          <p className="mt-1 text-xs text-red-600">All four options are required</p>
        )}

        {/* Solution */}
        <p className="mb-3 mt-6 text-sm font-medium text-gray-800">Add Solution</p>
        <textarea
          {...register('explanation')}
          placeholder="Type here"
          className="min-h-[100px] w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />

        {/* Question settings */}
        <p className="mb-4 mt-8 text-base font-semibold text-gray-800">
          Question settings
        </p>
        <div className="space-y-5">
          <Select
            label="Level of Difficulty"
            placeholder="Select from Drop-down"
            options={DIFFICULTY_OPTIONS}
            {...register('difficulty')}
          />
          <Select
            label="Topic"
            placeholder="Select from Drop-down"
            options={(test.topics ?? []).map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="Sub-topic"
            placeholder="Select from Drop-down"
            options={(test.sub_topics ?? []).map((t) => ({ value: t, label: t }))}
          />
        </div>

        {/* Add another */}
        <div className="mt-6">
          <Button type="submit" variant="secondary">
            {editingIndex !== null ? 'Update Question' : '+ Add Question'}
          </Button>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-100"
          >
            Exit Test Creation
          </button>
          <Button
            type="button"
            size="lg"
            className="px-10"
            onClick={handleSaveAndContinue}
            loading={saving}
          >
            Next
          </Button>
        </div>
      </form>
    </Workspace>
  )
}
