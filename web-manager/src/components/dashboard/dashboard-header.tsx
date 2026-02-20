'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useTheme } from 'next-themes'
import { logout } from '@/store/slices/authSlice'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet'
import {
  LogOut,
  Menu,
  Database,
  HardDrive,
  Video,
  Sun,
  Moon,
  ChartNoAxesCombined,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/user-growth', label: 'User Growth', icon: ChartNoAxesCombined },
  { href: '/database-tables', label: 'Database Tables', icon: Database },
  { href: '/db-backups', label: 'Db Backups', icon: HardDrive },
  { href: '/manage-videos', label: 'Manage Videos', icon: Video },
]

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  function handleSignOut() {
    dispatch(logout())
    router.push('/')
  }

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:px-6 lg:px-8">
      <div className="flex items-center">
        <img src="/images/KyberVisionLogo.png" alt="Kyber Vision" className="h-7 hidden dark:block" />
        <img src="/images/KyberVisionLogoBlack.png" alt="Kyber Vision" className="h-7 block dark:hidden" />
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        )}

        {/* Navigation menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="border-border bg-kyber-charcoal-dark flex flex-col"
          >
            <SheetHeader>
              <SheetTitle className="text-foreground">Navigation</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Kyber Vision Database Manager
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-kyber-purple/20 text-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                      }`}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>

            <div className="mt-auto px-4 pb-2">
              <div className="border-t border-border pt-4">
                <SheetClose asChild>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
