"use client";

import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Info,
  Loader2,
} from "lucide-react";

type ToastType = "success" | "error" | "info" | "loading";

interface ShowToastProps {
  type?: ToastType;
  title: string;
  description?: string;
  id?: string | number;
}

export function showToast({
  type = "info",
  title,
  description,
  id,
}: ShowToastProps) {
  const baseStyles =
    "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md";

  const variants = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
    loading: "bg-slate-50 border-slate-200 text-slate-900",
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
    loading: <Loader2 className="h-5 w-5 animate-spin text-slate-600" />,
  };

  return toast.custom(
    (t) => (
      <div className={`${baseStyles} ${variants[type]}`}>
        {icons[type]}
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{title}</p>
          {description && (
            <p className="text-xs opacity-80">{description}</p>
          )}
        </div>
      </div>
    ),
    { id }
  );
}