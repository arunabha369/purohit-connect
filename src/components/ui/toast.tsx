"use client"

import * as React from "react"
import { Toast } from "@base-ui/react/toast"
import { CheckCircle2, Info, TriangleAlert, XCircle, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

const toastManager = Toast.createToastManager()

function show(type: ToastType, title: string, description?: string) {
  return toastManager.add({
    type,
    title,
    description,
    priority: type === "error" ? "high" : "low",
  })
}

/** Fire-and-forget notifications, callable from anywhere on the client. */
export const toast = {
  success: (title: string, description?: string) => show("success", title, description),
  error: (title: string, description?: string) => show("error", title, description),
  info: (title: string, description?: string) => show("info", title, description),
  warning: (title: string, description?: string) => show("warning", title, description),
}

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: TriangleAlert,
}

const iconTone: Record<ToastType, string> = {
  success: "text-success",
  error: "text-destructive",
  info: "text-info",
  warning: "text-warning",
}

function ToastList() {
  const { toasts } = Toast.useToastManager()
  return toasts.map((t) => {
    const type = (t.type as ToastType) ?? "info"
    const Icon = icons[type] ?? Info
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "[--gap:0.625rem] [--peek:0.625rem] [--scale:calc(max(0,1-(var(--toast-index)*0.08)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]",
          "absolute top-0 right-0 left-0 z-[calc(1000-var(--toast-index))] mx-auto w-full origin-top select-none",
          "rounded-2xl border border-border-strong bg-popover/95 text-foreground shadow-elevated backdrop-blur-xl",
          "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]",
          "h-[var(--height)] data-expanded:h-[var(--toast-height)] data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
          "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
          "data-limited:opacity-0 data-starting-style:[transform:translateY(-150%)] data-ending-style:opacity-0 [&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(-150%)]",
          "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "[transition:transform_0.45s_cubic-bezier(0.22,1,0.36,1),opacity_0.4s,height_0.15s]"
        )}
      >
        <Toast.Content className="flex items-start gap-3 overflow-hidden p-4 transition-opacity duration-200 data-behind:opacity-0 data-expanded:opacity-100">
          <Icon className={cn("mt-0.5 size-5 shrink-0", iconTone[type])} />
          <div className="min-w-0 flex-1">
            <Toast.Title className="text-sm font-semibold leading-snug" />
            <Toast.Description className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground empty:hidden" />
          </div>
          <Toast.Close
            aria-label="Dismiss notification"
            className="-mt-1 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <XIcon className="size-4" />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    )
  })
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} limit={3}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed top-3 right-3 left-3 z-[100] mx-auto w-auto sm:top-5 sm:right-5 sm:left-auto sm:w-[22rem]">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
