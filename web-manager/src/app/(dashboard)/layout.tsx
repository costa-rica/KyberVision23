import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { AuthGuard } from '@/components/dashboard/auth-guard'
import { Footer } from '@/components/footer'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-dvh flex-col">
        {/* Subtle volleyball background */}
        <div
          className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-[0.04]"
          style={{
            backgroundImage: 'url(/images/imgBackgroundBottomFade.png)',
          }}
          aria-hidden="true"
        />
        <DashboardHeader />
        <main className="relative z-10 flex-1 px-4 pb-8 pt-4 md:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
