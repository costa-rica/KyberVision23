'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/modals/login-modal'
import { RegisterModal } from '@/components/modals/register-modal'
import { ForgotPasswordModal } from '@/components/modals/forgot-password-modal'
import { Database, Sun, Moon } from 'lucide-react'
import { Footer } from '@/components/footer'

type ModalView = 'none' | 'login' | 'register' | 'forgot-password'

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<ModalView>('none')
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  const handleAuthSuccess = () => {
    setActiveModal('none')
    router.push('/dashboard')
  }

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Background volleyball image */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-[0.07]"
        style={{
          backgroundImage: 'url(/images/imgBackgroundBottomFade.png)',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <img
          src="/images/KyberVisionLogo.png"
          alt="Kyber Vision"
          className="h-8 md:h-10 hidden dark:block"
        />
        <img
          src="/images/KyberVisionLogoBlack.png"
          alt="Kyber Vision"
          className="h-8 md:h-10 block dark:hidden"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveModal('login')}
            variant="outline"
            className="rounded-full border-kyber-purple text-kyber-purple-light hover:bg-kyber-purple hover:text-primary-foreground"
          >
            Sign In
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Database className="size-4 text-kyber-purple-light" />
            <span>Database Management Suite</span>
          </div>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Kyber Vision{' '}
            <span className="text-kyber-purple-light">Database Manager</span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-pretty leading-relaxed text-muted-foreground md:text-lg">
            Explore, manage, and update your volleyball analytics data. View
            tables, edit records, and keep your database in sync — all from one
            place.
          </p>

          <Button
            onClick={() => setActiveModal('login')}
            size="lg"
            className="rounded-full bg-kyber-purple px-8 text-primary-foreground hover:bg-kyber-purple-hover"
          >
            Get Started
          </Button>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={activeModal === 'login'}
        onClose={() => setActiveModal('none')}
        onSuccess={handleAuthSuccess}
        onForgotPassword={() => setActiveModal('forgot-password')}
        onRegister={() => setActiveModal('register')}
      />
      <RegisterModal
        isOpen={activeModal === 'register'}
        onClose={() => setActiveModal('none')}
        onSuccess={handleAuthSuccess}
        onLogin={() => setActiveModal('login')}
      />
      <ForgotPasswordModal
        isOpen={activeModal === 'forgot-password'}
        onClose={() => setActiveModal('none')}
        onLogin={() => setActiveModal('login')}
      />
    </div>
  )
}
