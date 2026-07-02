import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { loginSchema } from '../lib/validation'
import type { LoginForm } from '../lib/validation'
import { login as loginRequest } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  async function onSubmit(values: LoginForm) {
    setServerError(null)
    try {
      const { token, user } = await loginRequest(values.userId, values.password)
      login(token, user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-lg font-bold text-white">
            P
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your tests
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="userId"
              label="User ID"
              placeholder="Enter your user ID"
              autoComplete="username"
              error={errors.userId?.message}
              {...register('userId')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
