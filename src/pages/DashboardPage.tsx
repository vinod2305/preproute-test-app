import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTests, useDeleteTest } from '../hooks/useTests'
import type { Test } from '../types'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { PageLoader } from '../components/ui/Spinner'
import { useToast } from '../components/ui/Toast'
import { formatDate } from '../lib/format'

type StatusFilter = 'all' | 'draft' | 'live'

export function DashboardPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { data: tests, isLoading, isError, error } = useTests()
  const deleteTest = useDeleteTest()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [toDelete, setToDelete] = useState<Test | null>(null)

  const filtered = useMemo(() => {
    if (!tests) return []
    return tests.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.trim().toLowerCase())
      const status = t.status ?? 'draft'
      const matchesStatus = statusFilter === 'all' || status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [tests, search, statusFilter])

  async function handleDelete() {
    if (!toDelete) return
    try {
      await deleteTest.mutateAsync(toDelete.id)
      notify('Test deleted', 'success')
      setToDelete(null)
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete', 'error')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit and publish your tests
          </p>
        </div>
        <Button onClick={() => navigate('/tests/new')}>+ Create New Test</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          className="input-base sm:max-w-xs"
          placeholder="Search by test name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {(['all', 'draft', 'live'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={
                'rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ' +
                (statusFilter === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <PageLoader label="Loading tests…" />}

      {isError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load tests'}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-slate-500">No tests found.</p>
          <Button className="mt-4" onClick={() => navigate('/tests/new')}>
            Create your first test
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Questions</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600">{t.subject}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.questions?.length ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/tests/${t.id}/preview`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/tests/${t.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setToDelete(t)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.subject}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span>{t.questions?.length ?? 0} questions</span>
                  <span>{formatDate(t.created_at)}</span>
                </div>
                <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tests/${t.id}/preview`)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/tests/${t.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => setToDelete(t)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete test"
        footer={
          <>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteTest.isPending} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        Are you sure you want to delete{' '}
        <span className="font-semibold text-slate-900">{toDelete?.name}</span>? This
        action cannot be undone.
      </Modal>
    </div>
  )
}
