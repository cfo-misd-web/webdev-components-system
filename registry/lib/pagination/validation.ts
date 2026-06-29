import { z } from "zod";

// =============================================================================
// SCHEMA
// Zod schema defining the shape of the Pagination configuration.
// =============================================================================

/**
 * Configuration schema for the Pagination component.
 * Validates the props passed to the component at the boundaries.
 *
 * @example
 * ```ts
 * const config: PaginationConfig = {
 *   pageParamName: "page",
 *   pageSize: 20,
 * }
 * ```
 */
export const PaginationConfigSchema = z.object({
  /**
   * The URL search parameter key used to store the current page number.
   * @default "page"
   * @example "p" | "currentPage" | "page"
   */
  pageParamName: z.string().min(1).default("page"),

  /**
   * Number of items displayed per page.
   * @default 20
   * @example 10 | 20 | 50
   */
  pageSize: z.number().min(1).default(20),
});

export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;

// =============================================================================
// PAGE PARAM HELPERS
// Pure functions for reading and writing the page URL param.
// The component never touches the URL directly — it calls these instead.
// Each function returns a new value without mutating the input.
// =============================================================================

/**
 * Builds a URLSearchParams instance from a raw param value string.
 * Returns an empty URLSearchParams if the raw value is empty.
 *
 * Pure function — no side effects.
 *
 * @param paramName - The key to use in the params.
 * @param raw - The raw string value from the adapter.
 * @returns A URLSearchParams instance with the param set if raw is non-empty.
 *
 * @example
 * ```ts
 * buildParamsFromRaw("page", "3")
 * // → URLSearchParams { page: "3" }
 *
 * buildParamsFromRaw("page", "")
 * // → URLSearchParams {}
 * ```
 */
export function buildParamsFromRaw(
  paramName: string,
  raw: string,
): URLSearchParams {
  return new URLSearchParams(raw ? `${paramName}=${raw}` : "");
}

/**
 * Reads the current page number from a URLSearchParams instance.
 * Falls back to page 1 if the param is missing or invalid.
 *
 * Pure function — does not mutate the params object.
 *
 * @param params - The current URLSearchParams instance.
 * @param paramName - The key to read from the params.
 * @returns The current page number, minimum 1.
 *
 * @example
 * ```ts
 * const params = new URLSearchParams("?page=3")
 * getPageParam(params, "page") // → 3
 * getPageParam(params, "page") // → 1 (if missing or invalid)
 * ```
 */
export function getPageParam(
  params: URLSearchParams,
  paramName: string,
): number {
  const raw = params.get(paramName);
  const parsed = raw ? parseInt(raw, 10) : 1;
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

/**
 * Returns a new URLSearchParams with the page param set.
 * If the page is 1, the param is removed to keep the URL clean.
 *
 * Pure function — does not mutate the input params object.
 *
 * @param params - The current URLSearchParams instance.
 * @param paramName - The key to set in the params.
 * @param page - The page number to set.
 * @returns A new URLSearchParams with the updated page value.
 *
 * @example
 * ```ts
 * const params = new URLSearchParams()
 * setPageParam(params, "page", 3)
 * // → URLSearchParams { page: "3" }
 *
 * setPageParam(params, "page", 1)
 * // → URLSearchParams {} (param removed when page is 1)
 * ```
 */
export function setPageParam(
  params: URLSearchParams,
  paramName: string,
  page: number,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (page <= 1) {
    next.delete(paramName);
  } else {
    next.set(paramName, String(page));
  }
  return next;
}

// =============================================================================
// PAGINATION MATH HELPERS
// Pure functions for computing pagination values.
// These are router-agnostic and can be used anywhere.
// =============================================================================

/**
 * Computes the total number of pages given a total item count and page size.
 *
 * Pure function — no side effects.
 *
 * @param totalItems - Total number of items across all pages.
 * @param pageSize - Number of items per page.
 * @returns The total number of pages, minimum 1.
 *
 * @example
 * ```ts
 * getTotalPages(100, 20) // → 5
 * getTotalPages(101, 20) // → 6
 * getTotalPages(0, 20)   // → 1
 * ```
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0 || pageSize <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

/**
 * Clamps a page number to a valid range between 1 and totalPages.
 *
 * Pure function — no side effects.
 *
 * @param page - The page number to clamp.
 * @param totalPages - The maximum valid page number.
 * @returns The clamped page number.
 *
 * @example
 * ```ts
 * clampPage(0, 5)  // → 1
 * clampPage(3, 5)  // → 3
 * clampPage(7, 5)  // → 5
 * ```
 */
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * Resolves the next valid page number after clamping to the valid range.
 * Separates the compute logic from the side effect of applying it.
 *
 * Pure function — no side effects.
 *
 * @param page - The requested page number.
 * @param totalPages - The maximum valid page number.
 * @returns The clamped, valid page number.
 *
 * @example
 * ```ts
 * resolveNextPage(0, 5)   // → 1
 * resolveNextPage(3, 5)   // → 3
 * resolveNextPage(99, 5)  // → 5
 * ```
 */
export function resolveNextPage(page: number, totalPages: number): number {
  return clampPage(page, totalPages);
}

/**
 * Computes the slice indices for client-side pagination.
 * Use these to slice an array to the current page's items.
 *
 * Pure function — no side effects.
 *
 * @param page - The current page number (1-indexed).
 * @param pageSize - Number of items per page.
 * @returns An object with `start` and `end` indices for Array.slice().
 *
 * @example
 * ```ts
 * getSliceRange(1, 20) // → { start: 0, end: 20 }
 * getSliceRange(2, 20) // → { start: 20, end: 40 }
 * getSliceRange(3, 10) // → { start: 20, end: 30 }
 * ```
 */
export function getSliceRange(
  page: number,
  pageSize: number,
): { start: number; end: number } {
  const start = (page - 1) * pageSize;
  return { start, end: start + pageSize };
}

/**
 * Computes the page numbers and ellipsis markers to display in a
 * range-style pagination control (e.g. `1 ... 4 5 6 ... 10`).
 *
 * Always shows the first and last page. Shows `siblings` page numbers
 * on each side of the current page. Inserts `"ellipsis"` markers where
 * page numbers are skipped.
 *
 * Pure function — no side effects.
 *
 * @param currentPage - The current page number (1-indexed).
 * @param totalPages - The total number of pages.
 * @param siblings - Pages to show on each side of the current page.
 * @returns An array of page numbers and `"ellipsis"` markers.
 *
 * @example
 * ```ts
 * getPageRange(5, 10, 1)
 * // → [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 *
 * getPageRange(2, 10, 1)
 * // → [1, 2, 3, 4, 5, "ellipsis", 10]
 *
 * getPageRange(9, 10, 1)
 * // → [1, "ellipsis", 6, 7, 8, 9, 10]
 *
 * getPageRange(3, 5, 1)
 * // → [1, 2, 3, 4, 5] (all pages shown when total is small)
 * ```
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  siblings: number = 1,
): (number | "ellipsis")[] {
  const totalPageSlots = siblings * 2 + 5;
  if (totalPages <= totalPageSlots) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblings, 1);
  const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1);
    return [...leftRange, "ellipsis", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblings * 2;
    const rightRange = Array.from(
      { length: rightCount },
      (_, i) => totalPages - rightCount + i + 1,
    );
    return [1, "ellipsis", ...rightRange];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [1, "ellipsis", ...middleRange, "ellipsis", totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
}
