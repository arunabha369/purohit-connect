"use client"

import * as React from "react"
import { AlertDialog } from "@base-ui/react/alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: "default" | "destructive"
  icon?: React.ReactNode
  onConfirm: () => void
}

/** Accessible confirmation step for destructive or irreversible actions. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Go back",
  tone = "default",
  icon,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border-strong bg-popover p-6 text-center shadow-elevated transition-[opacity,transform] duration-200 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:text-left">
          {icon && (
            <div
              className={cn(
                "mx-auto mb-4 flex size-12 items-center justify-center rounded-full sm:mx-0",
                tone === "destructive" ? "bg-destructive/12 text-destructive" : "bg-primary/12 text-primary"
              )}
            >
              {icon}
            </div>
          )}
          <AlertDialog.Title className="font-heading text-lg font-semibold text-foreground">
            {title}
          </AlertDialog.Title>
          {description && (
            <AlertDialog.Description className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </AlertDialog.Description>
          )}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Close className={buttonVariants({ variant: "outline" })}>
              {cancelLabel}
            </AlertDialog.Close>
            <button
              type="button"
              className={buttonVariants({ variant: tone === "destructive" ? "destructive" : "default" })}
              onClick={() => {
                onConfirm()
                onOpenChange(false)
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
