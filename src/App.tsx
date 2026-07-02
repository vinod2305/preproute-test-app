import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { TestFormPage } from './pages/TestFormPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { PreviewPage } from './pages/PreviewPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tests/new" element={<TestFormPage />} />
          <Route path="/tests/:id/edit" element={<TestFormPage />} />
        </Route>
        {/* Questions & Preview use the question-workspace layout */}
        <Route path="/tests/:id/questions" element={<QuestionsPage />} />
        <Route path="/tests/:id/preview" element={<PreviewPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
