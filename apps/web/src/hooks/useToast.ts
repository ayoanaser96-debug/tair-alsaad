import { toast as sonnerToast } from "sonner";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastOptions = {
  description?: string;
  duration?: number;
};

function mapVariant(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return { className: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-100" };
    case "error":
      return { className: "border-red-200 bg-red-50 text-red-950 dark:bg-red-950/40 dark:text-red-100" };
    case "warning":
      return { className: "border-amber-200 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100" };
    case "info":
    default:
      return { className: "border-blue-200 bg-blue-50 text-blue-950 dark:bg-blue-950/40 dark:text-blue-100" };
  }
}

export function useToast() {
  return {
    toast: (message: string, variant: ToastVariant = "info", options?: ToastOptions) => {
      const { className } = mapVariant(variant);
      return sonnerToast(message, {
        description: options?.description,
        duration: options?.duration ?? 4000,
        className,
      });
    },
    dismiss: sonnerToast.dismiss,
  };
}
