"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg shadow-ambient min-w-[280px] max-w-md",
            "bg-surface-container-lowest border border-outline-variant"
          )}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-available flex-shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-primary flex-shrink-0" />}
          <p className="text-body-md text-on-surface flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-outline hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
