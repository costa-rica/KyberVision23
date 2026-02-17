'use client'

import { useState, useCallback } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/store/slices/authSlice'
import apiClient from '@/lib/api/client'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onLogin?: () => void
}

export function RegisterModal({
  isOpen,
  onClose,
  onSuccess,
  onLogin,
}: RegisterModalProps) {
  const dispatch = useDispatch()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.post('/users/register', {
          firstName,
          lastName,
          email,
          password,
        })
        dispatch(
          setCredentials({
            user: data.user,
            token: data.token,
          })
        )
        onSuccess()
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } }
        setError(
          axiosErr.response?.data?.message ??
            axiosErr.response?.data?.error ??
            'Registration failed. Please try again.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [firstName, lastName, email, password, dispatch, onSuccess],
  )

  if (!isOpen) return null

  return (
    <div
      className="animate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Register"
    >
      <div
        className="animate-modal-drop relative mx-4 w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close register"
        >
          <X className="size-5" />
        </button>

        <div className="mb-8 flex justify-center">
          <img
            src="/images/KyberVisionLogo.png"
            alt="Kyber Vision"
            className="h-10 hidden dark:block"
          />
        <img
            src="/images/KyberVisionLogoBlack.png"
            alt="Kyber Vision"
            className="h-10 block dark:hidden"
          />
        </div>

        <h2 className="mb-6 text-center text-xl font-semibold text-foreground">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-first" className="text-sm font-medium text-foreground">
                First Name
              </Label>
              <Input
                id="register-first"
                placeholder="First"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="register-last" className="text-sm font-medium text-foreground">
                Last Name
              </Label>
              <Input
                id="register-last"
                placeholder="Last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="register-password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground focus-visible:border-kyber-purple focus-visible:ring-kyber-purple/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onLogin}
              className="text-sm text-kyber-purple-light transition-colors hover:text-foreground"
            >
              Already have an account? Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
