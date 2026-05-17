import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export {
  formatAdminDateTime,
  formatAppCurrency,
  formatCurrency,
  formatDate,
  formatDistance,
  formatDuration,
  formatPhone,
  getInitials,
  truncate,
  type DateFormatStyle,
} from "@/lib/format";
