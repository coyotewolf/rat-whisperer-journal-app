import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const dialogContentStyles = "bg-card text-card-foreground p-0 flex flex-col w-[95vw] max-w-2xl max-h-[80vh]";
