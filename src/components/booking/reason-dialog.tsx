"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Asks for a reason before a consequential action (declining, cancelling,
 * rejecting). `onConfirm` returns an error message to keep the dialog open.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  reasons,
  confirmLabel,
  cancelLabel = "Go back",
  destructive = true,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  reasons: string[];
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: (reason: string) => string | void;
}) {
  const [choice, setChoice] = useState(reasons[0] ?? "Other");
  const [other, setOther] = useState("");
  const [error, setError] = useState("");
  const options = reasons.includes("Other") ? reasons : [...reasons, "Other"];
  const reason = choice === "Other" ? other.trim() : choice;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setChoice(options[0]);
          setOther("");
          setError("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <fieldset>
          <legend className="mb-3 text-sm font-medium text-foreground">Reason</legend>
          <div role="radiogroup" className="space-y-2">
            {options.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={choice === r}
                onClick={() => {
                  setChoice(r);
                  setError("");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors",
                  choice === r ? "border-primary bg-primary/8 text-foreground" : "border-border text-foreground/90 hover:bg-surface"
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                    choice === r ? "border-primary" : "border-border-strong"
                  )}
                >
                  {choice === r && <span className="size-2 rounded-full bg-primary" />}
                </span>
                {r}
              </button>
            ))}
          </div>
          {choice === "Other" && (
            <Textarea
              autoFocus
              value={other}
              onChange={(e) => {
                setOther(e.target.value.slice(0, 200));
                setError("");
              }}
              placeholder="Add a short explanation"
              aria-label="Reason"
              aria-invalid={!!error}
              className="mt-3 min-h-20"
            />
          )}
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={() => {
              if (!reason) {
                setError("Please add a reason.");
                return;
              }
              const result = onConfirm(reason);
              if (typeof result === "string") {
                setError(result);
                return;
              }
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
