import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names safely, resolving conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (conflict resolution).
 *
 * @param inputs - Any number of class values, conditionals, or arrays.
 * @returns A single merged class string.
 *
 * @example
 * ```ts
 * cn("px-2 py-1", isActive && "bg-blue-500", "px-4")
 * // → "py-1 bg-blue-500 px-4" (px-2 is overridden by px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
