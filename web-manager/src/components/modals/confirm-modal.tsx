'use client'

import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="animate-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="animate-modal-drop mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-2 text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-border text-muted-foreground hover:text-foreground"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            className={
              variant === 'danger'
                ? 'rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'rounded-full bg-kyber-purple text-primary-foreground hover:bg-kyber-purple-hover'
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
