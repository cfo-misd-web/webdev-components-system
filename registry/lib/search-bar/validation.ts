import { z } from "zod";

// =============================================================================
// SCHEMA
// Zod schema defining the shape of the SearchBar configuration.
// =============================================================================

/**
 * Configuration schema for the SearchBar component.
 * Validates the props passed to the component at the boundaries.
 *
 * @example
 * ```ts
 * const config: SearchBarConfig = {
 *   paramName: "search",
 *   debounceMs: 300,
 * }
 * ```
 */
export const SearchBarConfigSchema = z.object({
  /**
   * The URL search parameter key used to store the search query.
   * @default "search"
   * @example "q" | "query" | "search"
   */
  paramName: z.string().min(1).default("search"),

  /**
   * Debounce delay in milliseconds before the search param is updated.
   * Prevents excessive URL updates and server requests on every keystroke.
   * @default 300
   * @example 500
   */
  debounceMs: z.number().min(0).default(300),
});

export type SearchBarConfig = z.infer<typeof SearchBarConfigSchema>;

// =============================================================================
// URL PARAM HELPERS
// Pure functions for reading and writing URL search params.
// The component never touches the URL directly — it calls these instead.
// Each function returns a new value without mutating the input.
//
// Note: These functions are provided as utilities for consumers building
// their own router adapters — see the Next.js adapter example in the
// SearchBar component docs for usage.
// =============================================================================

/**
 * Reads the current search query from a URLSearchParams instance.
 *
 * Pure function — does not mutate the params object.
 *
 * @param params - The current URLSearchParams instance.
 * @param paramName - The key to read from the params.
 * @returns The current search query string, or empty string if not set.
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("?search=hello")
 * getSearchParam(params, "search") // → "hello"
 * getSearchParam(params, "q")      // → ""
 * ```
 */
export function getSearchParam(
  params: URLSearchParams,
  paramName: string,
): string {
  return params.get(paramName) ?? "";
}

/**
 * Returns a new URLSearchParams with the search query set.
 * If the value is empty, the param is removed entirely to keep the URL clean.
 *
 * Pure function — does not mutate the input params object.
 *
 * @param params - The current URLSearchParams instance.
 * @param paramName - The key to set in the params.
 * @param value - The search query to set.
 * @returns A new URLSearchParams with the updated value.
 *
 * @example
 * ```ts
 * const params = new URLSearchParams()
 * setSearchParam(params, "search", "hello")
 * // → URLSearchParams { search: "hello" }
 *
 * setSearchParam(params, "search", "")
 * // → URLSearchParams {} (param removed when empty)
 * ```
 */
export function setSearchParam(
  params: URLSearchParams,
  paramName: string,
  value: string,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (value.trim() === "") {
    next.delete(paramName);
  } else {
    next.set(paramName, value);
  }
  return next;
}

/**
 * Returns a new URLSearchParams with the search param removed.
 *
 * Pure function — does not mutate the input params object.
 *
 * @param params - The current URLSearchParams instance.
 * @param paramName - The key to remove from the params.
 * @returns A new URLSearchParams with the param removed.
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("?search=hello&page=1")
 * clearSearchParam(params, "search")
 * // → URLSearchParams { page: "1" }
 * ```
 */
export function clearSearchParam(
  params: URLSearchParams,
  paramName: string,
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(paramName);
  return next;
}

// =============================================================================
// DEBOUNCE
// Pure debounce factory — returns a debounced version of any function.
// Separated from the component so it can be tested independently.
// =============================================================================

/**
 * Returns a debounced version of the provided function.
 * The debounced function delays invoking the original until after
 * `delayMs` milliseconds have elapsed since the last call.
 *
 * Pure factory function — creates a new debounced function each time.
 * Always clean up the returned cancel function to avoid memory leaks.
 *
 * @param fn - The function to debounce.
 * @param delayMs - The delay in milliseconds.
 * @returns A debounced version of the function with a cancel method.
 *
 * @example
 * ```ts
 * const debounced = createDebounce((value: string) => {
 *   console.log(value)
 * }, 300)
 *
 * debounced("hello") // fires after 300ms of inactivity
 * debounced.cancel() // cancels any pending invocation
 * ```
 */
export function createDebounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number,
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };

  return debounced as T & { cancel: () => void };
}
