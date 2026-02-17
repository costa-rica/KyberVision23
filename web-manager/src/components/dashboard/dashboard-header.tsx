'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
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
import { LogOut, Menu, Database, HardDrive } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Database },
  { href: '/db-backups', label: 'Db Backups', icon: HardDrive },
]

export function DashboardHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-10 flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-sm md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <img
          src="/images/KyberVisionLogo.png"
          alt="Kyber Vision"
          className="h-7"
        />
        <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
          Database Manager
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => {
            dispatch(logout())
            router.push('/')
          }}
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>

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
            className="border-border bg-kyber-charcoal-dark"
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
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
