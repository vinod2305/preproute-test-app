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
    <div className="flex min-h-screen bg-white p-3">
      {/* Left illustration panel */}
      <div className="relative hidden w-1/2 items-center justify-center rounded-2xl bg-primary-50 lg:flex">
        <img
          src="/login-illustration.png"
          alt=""
          className="w-[70%] max-w-lg"
        />
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center rounded-2xl border border-primary-200 px-6 lg:w-1/2 lg:border-l-0">
        <div className="w-full max-w-[510px]">
          <img src="/logo.png" alt="PrepRoute" className="mb-10 h-8" />

          <h1 className="text-xl font-semibold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-500">
            Use your company provided Login credentials
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <Input
              id="userId"
              label="User ID"
              placeholder="Enter User ID"
              autoComplete="username"
              error={errors.userId?.message}
              {...register('userId')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter Password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="pt-1">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
