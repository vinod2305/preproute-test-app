import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { testSchema } from '../lib/validation'
import type { TestForm } from '../lib/validation'
import type { CreateTestPayload } from '../types'
import { useTest, useCreateTest, useUpdateTest } from '../hooks/useTests'
import { useSubjects, useTopics, useSubTopics } from '../hooks/useTaxonomy'
import { idsFromNames, toOptions } from '../lib/mappers'
import { DIFFICULTY_OPTIONS, TEST_TYPE_OPTIONS } from '../lib/constants'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { MultiSelect } from '../components/ui/MultiSelect'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'

type Intent = 'draft' | 'next'

const defaultValues: TestForm = {
  name: '',
  type: 'chapterwise',
  subject: '',
  topics: [],
  sub_topics: [],
  difficulty: 'medium',
  correct_marks: 4,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_time: 60,
  total_marks: 100,
  total_questions: 50,
}

export function TestFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { notify } = useToast()

  const { data: existing, isLoading: loadingExisting } = useTest(id)
  const { data: subjects } = useSubjects()
  const createTest = useCreateTest()
  const updateTest = useUpdateTest()

  const [savingIntent, setSavingIntent] = useState<Intent | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TestForm>({ resolver: zodResolver(testSchema), defaultValues })

  const subjectId = watch('subject')
  const topicIds = watch('topics')

  const { data: topics } = useTopics(subjectId || undefined)
  const { data: subTopics } = useSubTopics(topicIds)

  // ---- Prefill (edit mode): map returned names back to ids in stages ----
  const stage = useRef({ scalar: false, topics: false, subtopics: false })
  const pending = useRef<{ topics: string[]; subtopics: string[] }>({
    topics: [],
    subtopics: [],
  })

  useEffect(() => {
    if (!isEdit || !existing || !subjects || stage.current.scalar) return
    const mappedSubject = idsFromNames([existing.subject], subjects)[0] ?? ''
    reset({
      name: existing.name,
      type: existing.type,
      subject: mappedSubject,
      topics: [],
      sub_topics: [],
      difficulty: existing.difficulty,
      correct_marks: existing.correct_marks,
      wrong_marks: existing.wrong_marks,
      unattempt_marks: existing.unattempt_marks,
      total_time: existing.total_time,
      total_marks: existing.total_marks,
      total_questions: existing.total_questions,
    })
    pending.current.topics = existing.topics ?? []
    pending.current.subtopics = existing.sub_topics ?? []
    stage.current.scalar = true
  }, [isEdit, existing, subjects, reset])

  useEffect(() => {
    if (!stage.current.scalar || stage.current.topics || !topics) return
    setValue('topics', idsFromNames(pending.current.topics, topics))
    stage.current.topics = true
  }, [topics, setValue])

  useEffect(() => {
    if (!stage.current.topics || stage.current.subtopics || !subTopics) return
    setValue('sub_topics', idsFromNames(pending.current.subtopics, subTopics))
    stage.current.subtopics = true
  }, [subTopics, setValue])

  const subjectOptions = toOptions(subjects ?? [])
  const topicOptions = toOptions(topics ?? [])
  const subTopicOptions = toOptions(subTopics ?? [])

  async function onValid(values: TestForm, intent: Intent) {
    // Guard against stale sub-topic ids after topic edits.
    const validSubTopics = values.sub_topics.filter((s) =>
      subTopicOptions.some((o) => o.value === s),
    )
    const payload: CreateTestPayload = {
      name: values.name,
      type: values.type,
      subject: values.subject,
      topics: values.topics,
      sub_topics: validSubTopics,
      correct_marks: values.correct_marks,
      wrong_marks: values.wrong_marks,
      unattempt_marks: values.unattempt_marks,
      difficulty: values.difficulty,
      total_time: values.total_time,
      total_marks: values.total_marks,
      total_questions: values.total_questions,
      status: 'draft',
    }

    setSavingIntent(intent)
    try {
      let testId = id
      if (isEdit && id) {
        await updateTest.mutateAsync({ id, payload })
      } else {
        const created = await createTest.mutateAsync(payload)
        testId = created.id
      }
      if (intent === 'draft') {
        notify('Test saved as draft', 'success')
        navigate('/dashboard')
      } else {
        navigate(`/tests/${testId}/questions`)
      }
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save test', 'error')
    } finally {
      setSavingIntent(null)
    }
  }

  if (isEdit && loadingExisting) return <PageLoader label="Loading test…" />

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-3 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to tests
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? 'Edit Test' : 'Create New Test'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Step 1 of 3 — Test details &amp; marking scheme
        </p>
      </div>

      <form className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Basic details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                id="name"
                label="Test Name"
                placeholder="e.g. Algebra Chapter Test"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>

            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select
                  label="Subject"
                  placeholder="Select subject"
                  options={subjectOptions}
                  value={field.value}
                  error={errors.subject?.message}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    setValue('topics', [])
                    setValue('sub_topics', [])
                  }}
                />
              )}
            />

            <Select
              label="Test Type"
              options={TEST_TYPE_OPTIONS}
              error={errors.type?.message}
              {...register('type')}
            />

            <Controller
              name="topics"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Topics"
                  options={topicOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={!subjectId}
                  placeholder={subjectId ? 'Select topics' : 'Select a subject first'}
                  emptyText="No topics for this subject"
                  error={errors.topics?.message}
                />
              )}
            />

            <Controller
              name="sub_topics"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  label="Sub-topics"
                  options={subTopicOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={topicIds.length === 0}
                  placeholder={
                    topicIds.length ? 'Select sub-topics' : 'Select topics first'
                  }
                  emptyText="No sub-topics for these topics"
                />
              )}
            />

            <Select
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              error={errors.difficulty?.message}
              {...register('difficulty')}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Marking scheme &amp; structure
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              id="correct_marks"
              type="number"
              step="any"
              label="Correct Marks"
              error={errors.correct_marks?.message}
              {...register('correct_marks', { valueAsNumber: true })}
            />
            <Input
              id="wrong_marks"
              type="number"
              step="any"
              label="Wrong Marks"
              error={errors.wrong_marks?.message}
              {...register('wrong_marks', { valueAsNumber: true })}
            />
            <Input
              id="unattempt_marks"
              type="number"
              step="any"
              label="Unattempted Marks"
              error={errors.unattempt_marks?.message}
              {...register('unattempt_marks', { valueAsNumber: true })}
            />
            <Input
              id="total_time"
              type="number"
              label="Total Time (min)"
              error={errors.total_time?.message}
              {...register('total_time', { valueAsNumber: true })}
            />
            <Input
              id="total_marks"
              type="number"
              label="Total Marks"
              error={errors.total_marks?.message}
              {...register('total_marks', { valueAsNumber: true })}
            />
            <Input
              id="total_questions"
              type="number"
              label="Total Questions"
              error={errors.total_questions?.message}
              {...register('total_questions', { valueAsNumber: true })}
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            loading={savingIntent === 'draft'}
            disabled={savingIntent !== null}
            onClick={handleSubmit((v) => onValid(v, 'draft'))}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            loading={savingIntent === 'next'}
            disabled={savingIntent !== null}
            onClick={handleSubmit((v) => onValid(v, 'next'))}
          >
            Next: Add Questions →
          </Button>
        </div>
      </form>
    </div>
  )
}
