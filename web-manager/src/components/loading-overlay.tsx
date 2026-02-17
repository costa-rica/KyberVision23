'use client'

import { Spinner } from '@/components/ui/spinner'
import { Progress } from '@/components/ui/progress'

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Primary status message displayed below the spinner */
  message?: string
  /** Optional secondary detail line */
  detail?: string
  /** Optional progress value 0-100 (shows a progress bar when provided) */
  progress?: number
}

export function LoadingOverlay({
  visible,
  message = 'Loading...',
  detail,
  progress,
}: LoadingOverlayProps) {
  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card/90 px-10 py-8 shadow-xl">
        <Spinner className="size-8 text-kyber-purple" />

        <p className="text-sm font-medium text-foreground">{message}</p>

        {detail && (
          <p className="max-w-60 text-center text-xs text-muted-foreground">
            {detail}
          </p>
        )}

        {typeof progress === 'number' && (
          <div className="w-48">
            <Progress value={progress} className="h-1.5" />
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
