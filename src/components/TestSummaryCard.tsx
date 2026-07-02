import type { Test } from '../types'
import { ClockIcon, DocIcon, MarksIcon, CreateIcon } from './ui/icons'

const TYPE_LABEL: Record<string, string> = {
  chapterwise: 'Chapter Wise',
  previous_year: 'PYQ',
  mock_test: 'Mock Test',
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Difficult',
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-amber-300 px-2.5 py-0.5 text-xs font-medium text-amber-500">
      {children}
    </span>
  )
}

function Stat({
  icon: Icon,
  children,
}: {
  icon: typeof ClockIcon
  children: React.ReactNode
}) {
  return (
    <span className="flex items-center gap-1.5 px-3 text-xs text-gray-500">
      <Icon width={15} height={15} className="text-gray-400" />
      {children}
    </span>
  )
}

export function TestSummaryCard({
  test,
  onEdit,
}: {
  test: Test
  onEdit?: () => void
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <div className="mb-4 flex items-start justify-between">
        <span className="rounded-md bg-primary-900 px-3 py-1 text-xs font-semibold text-white">
          {TYPE_LABEL[test.type] ?? test.type}
        </span>
        {onEdit && (
          <button onClick={onEdit} className="text-primary-500 hover:text-primary-700">
            <CreateIcon width={18} height={18} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-lg">📘</span>
            <span className="text-lg font-semibold text-gray-900">{test.name}</span>
            <span className="flex items-center gap-1 rounded-full bg-teal-500 px-3 py-1 text-xs font-medium text-white">
              ◈ {DIFFICULTY_LABEL[test.difficulty] ?? test.difficulty}
            </span>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex gap-6">
              <dt className="w-20 text-gray-400">Subject</dt>
              <dd className="text-gray-700">: {test.subject}</dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-20 text-gray-400">Topic</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400">:</span>
                {(test.topics ?? []).length > 0 ? (
                  test.topics!.map((t) => <Pill key={t}>{t}</Pill>)
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </dd>
            </div>
            <div className="flex gap-6">
              <dt className="w-20 text-gray-400">Sub Topic</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400">:</span>
                {(test.sub_topics ?? []).length > 0 ? (
                  test.sub_topics!.map((t) => <Pill key={t}>{t}</Pill>)
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center divide-x divide-gray-200 rounded-lg border border-gray-200 py-1.5">
          <Stat icon={ClockIcon}>{test.total_time} Min</Stat>
          <Stat icon={DocIcon}>{test.total_questions} Q's</Stat>
          <Stat icon={MarksIcon}>{test.total_marks} Marks</Stat>
        </div>
      </div>
    </div>
  )
}
