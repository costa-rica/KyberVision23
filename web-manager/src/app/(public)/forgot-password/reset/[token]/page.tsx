'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const params = useParams<{ token: string | string[] }>()
  const router = useRouter()
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
  const token = useMemo(
    () => (Array.isArray(params?.token) ? params.token[0] : params?.token ?? ''),
    [params],
  )

  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || password.length < 3) {
      setError('Please enter a password with at least 3 characters.')
      return
    }

    if (!token) {
      setError('This password reset link is invalid.')
      return
    }

    if (!apiBaseUrl) {
      setError('API base URL is not configured.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await axios.post(
        `${apiBaseUrl}/users/reset-password-with-new-password`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setIsSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; error?: string } } }
      setError(
        axiosErr.response?.data?.message ??
          axiosErr.response?.data?.error ??
          'Error resetting password. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 flex justify-center">
          <img
            src="/images/KyberVisionLogo.png"
            alt="Kyber Vision"
            className="hidden h-10 dark:block"
          />
          <img
            src="/images/KyberVisionLogoBlack.png"
            alt="Kyber Vision"
            className="block h-10 dark:hidden"
          />
        </div>

        <h1 className="mb-2 text-center text-xl font-semibold text-foreground">
          Reset Password
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your new password below.
        </p>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-md border border-kyber-purple/30 bg-kyber-purple/10 px-4 py-3 text-center text-sm text-foreground">
              Password reset successfully. You can now sign in with your new password.
            </div>
            <Button
              type="button"
              onClick={() => router.push('/')}
              className="w-full rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
