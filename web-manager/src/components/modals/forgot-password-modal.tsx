'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import apiClient from '@/lib/api/client'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin?: () => void
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)
      try {
        await apiClient.post('/users/request-reset-password-email', { email })
        setSent(true)
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } }
        setError(
          axiosErr.response?.data?.message ??
            axiosErr.response?.data?.error ??
            'Failed to send reset email. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [email],
  )

  if (!isOpen) return null

  return (
    <div
      className="animate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Forgot Password"
    >
      <div
        className="animate-modal-drop relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close forgot password"
        >
          <X className="size-5" />
        </button>

        <div className="mb-8 flex justify-center">
          <img
            src="/images/KyberVisionLogo.png"
            alt="Kyber Vision"
            className="h-10"
          />
        </div>

        <h2 className="mb-2 text-center text-xl font-semibold text-foreground">
          Reset Password
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-md border border-kyber-purple/30 bg-kyber-purple/10 px-4 py-3 text-center text-sm text-foreground">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
              Check your inbox.
            </div>
            <button
              type="button"
              onClick={onLogin}
              className="text-sm text-kyber-purple-light transition-colors hover:text-foreground"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onLogin}
                className="text-sm text-kyber-purple-light transition-colors hover:text-foreground"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
