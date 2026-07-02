import { useNavigate, useParams } from 'react-router-dom'
import { useTest, usePublishTest } from '../hooks/useTests'
import { useQuestionsByIds } from '../hooks/useQuestions'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { cn } from '../lib/cn'
import type { CorrectOption } from '../types'

const OPTION_KEYS: CorrectOption[] = ['option1', 'option2', 'option3', 'option4']

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
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

  if (isLoading) return <PageLoader label="Loading preview…" />
  if (!test)
    return <div className="text-center text-slate-500">Test not found.</div>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-3 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Back to tests
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Preview &amp; Publish</h1>
            <p className="mt-1 text-sm text-slate-500">Step 3 of 3 — Review and publish</p>
          </div>
          <StatusBadge status={test.status} />
        </div>
      </div>

      {/* Test overview */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{test.name}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/tests/${id}/edit`)}
          >
            Edit Test
          </Button>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <DetailItem label="Subject" value={test.subject} />
          <DetailItem label="Type" value={test.type} />
          <DetailItem label="Difficulty" value={<span className="capitalize">{test.difficulty}</span>} />
          <DetailItem label="Topics" value={test.topics?.join(', ') || '—'} />
          <DetailItem label="Sub-topics" value={test.sub_topics?.join(', ') || '—'} />
          <DetailItem label="Total Time" value={`${test.total_time} min`} />
          <DetailItem label="Total Marks" value={test.total_marks} />
          <DetailItem label="Total Questions" value={test.total_questions} />
          <DetailItem
            label="Marking"
            value={`+${test.correct_marks} / ${test.wrong_marks} / ${test.unattempt_marks}`}
          />
        </dl>
      </section>

      {/* Questions */}
      <section className="mb-24">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
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

        {loadingQuestions && <PageLoader label="Loading questions…" />}

        {!loadingQuestions && questionIds.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-400">
            No questions added to this test yet.
          </div>
        )}

        <ol className="space-y-4">
          {questions?.map((q, i) => (
            <li
              key={q.id ?? i}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-card"
            >
              <p className="font-medium text-slate-900">
                {i + 1}. {q.question}
              </p>
              {q.media_url && (
                <a
                  href={q.media_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block text-xs text-primary-600 underline"
                >
                  View media
                </a>
              )}
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
                          : 'border-slate-200 text-slate-700',
                      )}
                    >
                      <span className="text-slate-400">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {q[key]}
                      {isCorrect && (
                        <span className="ml-auto text-xs text-green-600">✓ correct</span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {q.explanation && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Sticky publish bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <p className="text-sm text-slate-500">
            {test.status === 'live'
              ? 'This test is already live.'
              : 'Ready to publish this test?'}
          </p>
          <Button
            onClick={handlePublish}
            loading={publish.isPending}
            disabled={test.status === 'live'}
          >
            {test.status === 'live' ? 'Published' : 'Publish Test'}
          </Button>
        </div>
      </div>
    </div>
  )
}
