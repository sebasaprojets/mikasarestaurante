"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[80] bg-sumi/85 backdrop-blur-sm data-[state=open]:animate-[mk-fade-in_.6s_var(--ease-mikasa)] data-[state=closed]:animate-[mk-fade-out_.4s_var(--ease-mikasa)]",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  closeLabel = "Cerrar",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { closeLabel?: string }) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-lenis-prevent
        className={cn(
          "fixed left-1/2 top-1/2 z-[81] max-h-[92svh] w-[min(100vw-2rem,64rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-line bg-carvao text-washi outline-none data-[state=open]:animate-[mk-rise-in_.8s_var(--ease-mikasa)] data-[state=closed]:animate-[mk-fade-out_.4s_var(--ease-mikasa)]",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute right-3 top-3 z-10 grid size-11 place-items-center text-washi/80 transition-colors hover:text-ouro-claro"
          aria-label={closeLabel}
        >
          <X className="size-5" strokeWidth={1.25} aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

export { Dialog, DialogTrigger, DialogPortal, DialogClose, DialogOverlay, DialogContent, DialogTitle, DialogDescription };
