"use client";

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
  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-surface-container-lowest rounded-xl shadow-ambient w-full", sizeClass)}>
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
