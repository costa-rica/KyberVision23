'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Footer } from '@/components/footer'
import { Eye, EyeOff } from 'lucide-react'
import apiClient from '@/lib/api/client'

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const dispatch = useDispatch()

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await apiClient.delete('/users/delete-account', {
        data: { email, password },
      })
      dispatch(logout())
      router.push('/')
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          err?.response?.data?.error ??
          'Error deleting account. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-6 py-4 backdrop-blur-sm md:px-10">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            &larr; Back
          </Link>
          <Link href="/">
            <img
              src="/images/KyberVisionLogo.png"
              alt="Kyber Vision"
              className="h-7 hidden dark:block"
            />
        <img
              src="/images/KyberVisionLogoBlack.png"
              alt="Kyber Vision"
              className="h-7 block dark:hidden"
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <h1 className="mb-1 text-2xl font-bold text-foreground">
              Delete Account
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter your credentials to permanently delete your account. This
              action cannot be undone.
            </p>

            <form onSubmit={handleDeleteAccount} className="flex flex-col gap-5">
              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive-foreground">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="delete-email"
                  className="select-text text-sm font-medium text-foreground"
                >
                  Email
                </Label>
                <Input
                  id="delete-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="delete-password"
                  className="select-text text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="delete-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="border-border bg-secondary/50 pr-10 text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? 'Deleting account...' : 'Delete Account'}
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
