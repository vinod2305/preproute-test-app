import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTest, usePublishTest } from '../hooks/useTests'
import { useQuestionsByIds } from '../hooks/useQuestions'
import { Button } from '../components/ui/Button'
import { PageLoader, Spinner } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/cn'
import type { CorrectOption } from '../types'
import { Workspace, QuestionPanel } from '../components/layout/Workspace'
import { TestSummaryCard } from '../components/TestSummaryCard'

const OPTION_KEYS: CorrectOption[] = ['option1', 'option2', 'option3', 'option4']

const LIVE_OPTIONS = [
  'Always Available',
  '3 Weeks',
  '1 Week',
  '1 Month',
  '2 Weeks',
  'Custom Duration',
]

function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2.5">
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full border-2',
          checked ? 'border-primary-500' : 'border-gray-300',
        )}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />}
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </button>
  )
}

export function PreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const { data: test, isLoading } = useTest(id)
  const questionIds = test?.questions ?? []
  const { data: questions, isLoading: loadingQuestions } = useQuestionsByIds(questionIds)
  const publish = usePublishTest()

  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now')
  const [liveUntil, setLiveUntil] = useState('Always Available')

  async function handlePublish() {
    if (!id) return
    try {
      await publish.mutateAsync(id)
      notify('Test published successfully 🎉', 'success')
      navigate('/dashboard')
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to publish', 'error')
    }
  }

  if (isLoading || !test) return <PageLoader label="Loading preview…" />

  const panelItems = questionIds.map((_, i) => ({
    label: `Question ${i + 1}`,
    done: true,
  }))
  if (panelItems.length === 0) panelItems.push({ label: 'Question 1', done: false })

  const isLive = test.status === 'live'

  return (
    <Workspace panel={<QuestionPanel total={test.total_questions} items={panelItems} />}>
      <p className="mb-6 text-sm text-gray-400">Test creation</p>

      <div className="mb-5 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">Test created</h1>
        <span className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
            ✓
          </span>
          All {questionIds.length} Questions done
        </span>
      </div>

      <TestSummaryCard test={test} onEdit={() => navigate(`/tests/${id}/edit`)} />

      {/* Questions preview */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            Questions ({questionIds.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tests/${id}/questions`)}
          >
            Edit Questions
          </Button>
        </div>

        {loadingQuestions && (
          <div className="py-6 text-center">
            <Spinner />
          </div>
        )}

        {!loadingQuestions && questionIds.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400">
            No questions added to this test yet.
          </div>
        )}

        <ol className="space-y-3">
          {questions?.map((q, i) => (
            <li key={q.id ?? i} className="rounded-lg border border-gray-200 p-4">
              <p className="font-medium text-gray-900">
                {i + 1}. {q.question}
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OPTION_KEYS.map((key, idx) => {
                  const isCorrect = q.correct_option === key
                  return (
                    <li
                      key={key}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                        isCorrect
                          ? 'border-green-300 bg-green-50 font-medium text-green-800'
                          : 'border-gray-200 text-gray-700',
                      )}
                    >
                      <span className="text-gray-400">{String.fromCharCode(65 + idx)}.</span>
                      {q[key]}
                      {isCorrect && (
                        <span className="ml-auto text-xs text-green-600">✓ correct</span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {q.explanation && (
                <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-700">Solution: </span>
                  {q.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Publish mode toggle */}
      <div className="mt-8 inline-flex rounded-xl border border-gray-200 p-1">
        {(['now', 'schedule'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPublishMode(m)}
            className={cn(
              'rounded-lg px-5 py-2 text-sm font-medium transition-colors',
              publishMode === m
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-400 hover:text-gray-600',
            )}
          >
            {m === 'now' ? 'Publish Now' : 'Schedule Publish'}
          </button>
        ))}
      </div>

      {/* Live Until */}
      <h3 className="mb-1 mt-6 text-base font-semibold text-gray-800">Live Until</h3>
      <p className="mb-5 text-sm text-gray-500">
        Choose how long this test should remain available on the platform.
      </p>
      <div className="grid max-w-2xl grid-cols-2 gap-y-5">
        {LIVE_OPTIONS.map((opt) => (
          <Radio
            key={opt}
            label={opt}
            checked={liveUntil === opt}
            onChange={() => setLiveUntil(opt)}
          />
        ))}
      </div>

      <div className="mt-6 grid max-w-2xl grid-cols-2 gap-6">
        <input
          type="date"
          disabled={liveUntil !== 'Custom Duration'}
          className="input-base h-12"
          placeholder="Select End Date"
        />
        <select
          disabled={liveUntil !== 'Custom Duration'}
          className="input-base h-12 appearance-none"
          defaultValue=""
        >
          <option value="">Select End Time</option>
          <option>09:00 AM</option>
          <option>12:00 PM</option>
          <option>06:00 PM</option>
        </select>
      </div>

      {/* Actions */}
      <div className="mt-10 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
        <Button variant="secondary" className="px-8" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
        <Button
          size="lg"
          className="px-10"
          onClick={handlePublish}
          loading={publish.isPending}
          disabled={isLive}
        >
          {isLive ? 'Published' : 'Confirm'}
        </Button>
      </div>
    </Workspace>
  )
}
