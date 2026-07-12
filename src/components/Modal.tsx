"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, size = "md", footer }: ModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Esc key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Focus trap, autofocus, and restore focus on close
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Autofocus first focusable element
      const focusable = Array.from(
        containerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || []
      ) as HTMLElement[];

      if (focusable.length > 0) {
        focusable[0].focus();
      }

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const currentFocusable = Array.from(
          containerRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) || []
        ) as HTMLElement[];

        if (currentFocusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = currentFocusable[0];
        const last = currentFocusable[currentFocusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };

      window.addEventListener("keydown", handleTabKey);
      return () => {
        window.removeEventListener("keydown", handleTabKey);
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [open]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={containerRef}
        className={cn("relative bg-surface-container-lowest rounded-xl shadow-ambient w-full", sizeClass)}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-outline-variant">
            <h3 className="text-headline-md font-headline-md text-on-surface">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full">
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        )}
        <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-outline-variant">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
