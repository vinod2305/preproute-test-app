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
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { MultiSelect } from '../components/ui/MultiSelect'
import { Button } from '../components/ui/Button'
import { PageLoader } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/cn'

type Intent = 'draft' | 'next'

const TYPE_TABS = [
  { value: 'chapterwise', label: 'Chapterwise', crumb: 'Chapter Wise' },
  { value: 'previous_year', label: 'PYQ', crumb: 'PYQ' },
  { value: 'mock_test', label: 'Mock Test', crumb: 'Mock Test' },
]

const DIFFICULTY_RADIOS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Difficult' },
]

const defaultValues: TestForm = {
  name: '',
  type: 'chapterwise',
  subject: '',
  topics: [],
  sub_topics: [],
  difficulty: 'easy',
  correct_marks: 5,
  wrong_marks: -1,
  unattempt_marks: 0,
  total_time: 60,
  total_marks: 250,
  total_questions: 50,
}

function Radio({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border-2',
          checked ? 'border-primary-500' : 'border-gray-300',
        )}
      >
        {checked && <span className="h-3 w-3 rounded-full bg-primary-500" />}
      </span>
      <span className="text-base text-gray-700">{label}</span>
    </button>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div>
      <label className="mb-[15px] block text-base font-medium text-gray-700">{label}</label>
      <div className="relative w-full">
        <input
          type="number"
          value={Number.isNaN(value) ? '' : value}
          onChange={(e) => onChange(e.target.valueAsNumber)}
          className="input-base h-12 pr-9"
        />
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col">
          <button
            type="button"
            onClick={() => onChange((value || 0) + 1)}
            className="px-2 text-gray-400 hover:text-gray-700"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onChange((value || 0) - 1)}
            className="px-2 text-gray-400 hover:text-gray-700"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  )
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
  const activeType = watch('type')
  const difficulty = watch('difficulty')

  const { data: topics } = useTopics(subjectId || undefined)
  const { data: subTopics } = useSubTopics(topicIds)

  // ---- Prefill (edit): map returned names back to ids in stages ----
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

  const activeTypeCrumb =
    TYPE_TABS.find((t) => t.value === activeType)?.crumb ?? 'Chapter Wise'

  return (
    <div className="mx-auto max-w-[1152px]">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-base text-gray-500">
        <span>Test Creation</span>
        <span className="text-gray-400">/</span>
        <span>{isEdit ? 'Edit Test' : 'Create Test'}</span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-700">{activeTypeCrumb}</span>
      </nav>

      {/* Type tabs */}
      <div className="mb-8 inline-flex h-[50px] items-center gap-2 rounded-xl border-[0.5px] border-gray-300 px-2.5">
        {TYPE_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setValue('type', t.value)}
            className={cn(
              'flex h-10 items-center rounded-lg px-4 text-sm font-medium transition-colors',
              activeType === t.value
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form>
        <div className="grid grid-cols-1 gap-x-[50px] gap-y-[30px] md:grid-cols-2">
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select
                label="Subject"
                placeholder="Choose from Drop-down"
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

          <Input
            id="name"
            label="Name of Test"
            placeholder="Enter name of Test"
            error={errors.name?.message}
            {...register('name')}
          />

          <Controller
            name="topics"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Topic"
                options={topicOptions}
                value={field.value}
                onChange={field.onChange}
                disabled={!subjectId}
                placeholder="Choose from Drop-down"
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
                label="Sub Topic"
                options={subTopicOptions}
                value={field.value}
                onChange={field.onChange}
                disabled={topicIds.length === 0}
                placeholder="Choose from Drop-down"
                emptyText="No sub-topics for these topics"
              />
            )}
          />

          <Input
            id="total_time"
            type="number"
            label="Duration (Minutes)"
            placeholder="Enter the time"
            error={errors.total_time?.message}
            {...register('total_time', { valueAsNumber: true })}
          />

          <div>
            <label className="label-base">Test Difficulty Level</label>
            <div className="flex h-12 items-center justify-between pr-4">
              {DIFFICULTY_RADIOS.map((d) => (
                <Radio
                  key={d.value}
                  label={d.label}
                  checked={difficulty === d.value}
                  onChange={() => setValue('difficulty', d.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Marking scheme */}
        <p className="mb-6 mt-[30px] text-base font-medium text-gray-700">Marking Scheme:</p>
        <div className="grid grid-cols-2 gap-x-[50px] gap-y-6 md:grid-cols-5">
          <Controller
            name="wrong_marks"
            control={control}
            render={({ field }) => (
              <Stepper label="Wrong Answer" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            name="unattempt_marks"
            control={control}
            render={({ field }) => (
              <Stepper label="Unattempted" value={field.value} onChange={field.onChange} />
            )}
          />
          <Controller
            name="correct_marks"
            control={control}
            render={({ field }) => (
              <Stepper
                label="Correct Answer"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          <Input
            id="total_questions"
            type="number"
            label="No of Questions"
            placeholder="Ex:250 Marks"
            error={errors.total_questions?.message}
            {...register('total_questions', { valueAsNumber: true })}
          />
          <Input
            id="total_marks"
            type="number"
            label="Total Marks"
            placeholder="Ex:250 Marks"
            error={errors.total_marks?.message}
            {...register('total_marks', { valueAsNumber: true })}
          />
        </div>

        {/* Actions */}
        <div className="mt-[50px] flex justify-end gap-5">
          <button
            type="button"
            disabled={savingIntent !== null}
            onClick={() => navigate('/dashboard')}
            className="h-12 w-40 rounded-lg bg-primary-50 text-base font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <Button
            type="button"
            size="lg"
            className="w-40"
            loading={savingIntent === 'next'}
            disabled={savingIntent !== null}
            onClick={handleSubmit((v) => onValid(v, 'next'))}
          >
            Next
          </Button>
        </div>
      </form>
    </div>
  )
}
