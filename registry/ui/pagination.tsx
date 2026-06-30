"use client";

import * as React from "react";
import { Pagination as KumoPagination, Button } from "@cloudflare/kumo";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import {
  getPageParam,
  getTotalPages,
  clampPage,
  getPageRange,
  buildParamsFromRaw,
  resolveNextPage,
} from "@/lib/pagination/validation";
import { cn } from "@/utils/cn";
import type { ScrollBehavior } from "@/utils/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Adapter interface for reading and writing the page URL param.
 *
 * Inject this to make the Pagination work with any router.
 * The component never touches the URL directly — it calls these functions.
 *
 * @example TanStack Router
 * ```tsx
 * const router = useRouter()
 * const search = useSearch({ from: '/your-route' })
 * const searchParams = search as Record<string, string | undefined>
 *
 * const adapter: PaginationRouterAdapter = {
 *   getParam: (key) => searchParams[key] ?? "",
 *   setParam: (key, value, resetScroll) =>
 *     router.navigate({
 *       from: '/your-route',
 *       resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
 *       search: (prev) => ({ ...prev, [key]: value }) as any,
 *     }).then(() => {
 *       if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *     }),
 * }
 * ```
 *
 * @example Next.js
 * ```tsx
 * const router = useRouter()
 * const searchParams = useSearchParams()
 *
 * const adapter: PaginationRouterAdapter = {
 *   getParam: (key) => searchParams.get(key) ?? "",
 *   setParam: (key, value, resetScroll) => {
 *     const params = new URLSearchParams(searchParams.toString())
 *     params.set(key, value)
 *     router.push(`?${params.toString()}`)
 *     if (resetScroll === true) window.scrollTo({ top: 0 })
 *     if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *   },
 * }
 * ```
 */
export interface PaginationRouterAdapter {
  /**
   * Reads the current value of a URL param.
   * @param paramName - The param key to read.
   * @returns The current value or empty string if not set.
   */
  getParam: (paramName: string) => string;

  /**
   * Sets a URL param to the given value.
   * @param paramName - The param key to set.
   * @param value - The value to set.
   * @param resetScroll - Optional scroll behavior after update.
   */
  setParam: (
    paramName: string,
    value: string,
    resetScroll?: ScrollBehavior,
  ) => void;
}

/**
 * Style overrides for the Pagination component.
 * All keys are optional — only override what you need.
 *
 * Range-specific keys (`rangeContainer`, `pageButton`, `pageButtonActive`,
 * `ellipsis`, `prevButton`, `nextButton`) only apply when `controls="range"`.
 *
 * Always use Kumo semantic color tokens (e.g. `text-kumo-subtle`) instead
 * of raw Tailwind colors to ensure light/dark mode compatibility.
 *
 * @example Basic
 * ```tsx
 * classNames={{
 *   root: "mt-4 justify-center",
 *   pagination: "shadow-sm",
 * }}
 * ```
 *
 * @example Range mode
 * ```tsx
 * classNames={{
 *   root: "mt-4",
 *   rangeContainer: "gap-2",
 *   pageButton: "text-kumo-subtle",
 *   pageButtonActive: "ring-kumo-brand",
 *   ellipsis: "text-kumo-subtle",
 *   prevButton: "text-kumo-default",
 *   nextButton: "text-kumo-default",
 * }}
 * ```
 */
export interface PaginationClassNames {
  /** The outermost wrapper div. */
  root?: string;
  /** Passed directly to Kumo's Pagination className prop. Used for full/simple modes. */
  pagination?: string;
  /** The flex container wrapping all range controls. Used for range mode only. */
  rangeContainer?: string;
  /** Individual inactive page number buttons. Used for range mode only. */
  pageButton?: string;
  /** The active (current) page number button. Used for range mode only. */
  pageButtonActive?: string;
  /** The ellipsis `…` separator between page groups. Used for range mode only. */
  ellipsis?: string;
  /** The previous page button. Used for range mode only. */
  prevButton?: string;
  /** The next page button. Used for range mode only. */
  nextButton?: string;
}

/**
 * Props for the Pagination component.
 */
export interface PaginationProps {
  /**
   * Adapter that connects the Pagination to your router.
   * Provides getParam and setParam functions so the component
   * stays router-agnostic.
   */
  adapter: PaginationRouterAdapter;

  /**
   * Total number of items across all pages.
   * Used to compute the total page count.
   */
  totalItems: number;

  /**
   * Number of items displayed per page.
   * @default 20
   */
  pageSize?: number;

  /**
   * The URL search parameter key used to store the current page number.
   * Page 1 is never written to the URL to keep it clean.
   * @default "page"
   * @example "p" | "currentPage"
   */
  pageParamName?: string;

  /**
   * Pagination control style.
   * - `"full"` — Kumo's full controls: first, previous, page input/dropdown, next, last
   * - `"simple"` — Kumo's simple controls: previous and next only
   * - `"range"` — Custom range display: `‹ 1 … 4 5 6 … 10 ›`
   *
   * Note: `pageSelector` and `pageSizeOptions` only apply to `"full"` and `"simple"` modes.
   * `prevNextAs`, `prevNextLabels`, and `siblings` only apply to `"range"` mode.
   *
   * @default "full"
   */
  controls?: "full" | "simple" | "range";

  /**
   * Controls how the page number is selected in `"full"` and `"simple"` modes.
   * - `"input"` — text input for typing a page number (default)
   * - `"dropdown"` — dropdown select showing all available pages.
   *   Best for datasets with a manageable number of pages.
   *
   * Not available in `"range"` mode — range mode uses its own page buttons.
   * Automatically switches to the compound layout when set to `"dropdown"`.
   *
   * @default "input"
   * @optional
   *
   * @example
   * ```tsx
   * <Pagination
   *   adapter={adapter}
   *   totalItems={100}
   *   pageSelector="dropdown"
   * />
   * ```
   */
  pageSelector?: "input" | "dropdown";

  /**
   * Controls scroll behavior when the page changes.
   * - `false` — no scroll reset, page stays in place (default)
   * - `true` — scrolls to top instantly
   * - `"smooth"` — scrolls to top smoothly
   * @default false
   */
  resetScroll?: ScrollBehavior;

  /**
   * Optional callback fired when the page changes.
   * Use this to trigger server-side data refetching.
   *
   * @optional
   * @param page - The new page number.
   *
   * @example Server-side pagination
   * ```tsx
   * <Pagination
   *   adapter={adapter}
   *   totalItems={totalUsers}
   *   onPageChange={(page) => refetch({ page })}
   * />
   * ```
   */
  onPageChange?: (page: number) => void;

  /**
   * When provided, renders a page size dropdown alongside the pagination
   * controls using Kumo's compound API.
   *
   * Only applies to `"full"` and `"simple"` control modes — not `"range"`.
   * The page automatically resets to 1 when the page size changes.
   * Can be combined with `pageSelector="dropdown"`.
   *
   * @optional
   * @example
   * ```tsx
   * <Pagination
   *   adapter={adapter}
   *   totalItems={100}
   *   pageSize={pageSize}
   *   pageSizeOptions={[10, 20, 50]}
   *   onPageSizeChange={(size) => setPageSize(size)}
   * />
   * ```
   */
  pageSizeOptions?: number[];

  /**
   * Callback fired when the user selects a new page size.
   * Use this to update your `pageSize` state.
   * The page automatically resets to 1 when page size changes.
   *
   * @optional
   * @param size - The newly selected page size.
   */
  onPageSizeChange?: (size: number) => void;

  /**
   * Number of page buttons to show on each side of the current page
   * in `"range"` control mode.
   *
   * For example, with `siblings=1` and current page 5 of 10:
   * `‹ 1 … 4 [5] 6 … 10 ›`
   *
   * With `siblings=2` and current page 5 of 10:
   * `‹ 1 … 3 4 [5] 6 7 … 10 ›`
   *
   * Only applies to `"range"` mode.
   *
   * @default 1
   * @optional
   */
  siblings?: number;

  /**
   * Controls whether the previous and next buttons show arrows or words.
   * Only applies to `"range"` control mode.
   *
   * - `"arrows"` — shows `‹` and `›` icons (default)
   * - `"words"` — shows text labels (customizable via `prevNextLabels`)
   *
   * @default "arrows"
   * @optional
   */
  prevNextAs?: "arrows" | "words";

  /**
   * Custom labels for the previous and next buttons when `prevNextAs="words"`.
   * Only applies to `"range"` control mode.
   *
   * @optional
   * @example
   * ```tsx
   * <Pagination
   *   adapter={adapter}
   *   totalItems={100}
   *   controls="range"
   *   prevNextAs="words"
   *   prevNextLabels={{ previous: "Prev", next: "Next" }}
   * />
   * ```
   */
  prevNextLabels?: {
    /** Label for the previous page button. @default "Previous" */
    previous?: string;
    /** Label for the next page button. @default "Next" */
    next?: string;
  };

  /**
   * Tailwind class overrides for each visual part of the component.
   * Always use Kumo semantic color tokens instead of raw Tailwind colors.
   *
   * @optional
   * @example
   * ```tsx
   * classNames={{
   *   root: "mt-4 justify-center",
   *   pagination: "shadow-sm",
   * }}
   * ```
   */
  classNames?: PaginationClassNames;
}

// =============================================================================
// DEFAULT STYLES
// Pure style data for each styleable part of the component.
// All colors use Kumo semantic tokens for light/dark mode compatibility.
// =============================================================================

/**
 * Default Tailwind styles for each named part of the component.
 * Consumer classNames are merged on top via cn().
 * All colors use Kumo semantic tokens.
 */
const DEFAULT_STYLES = {
  root: "flex w-full items-center justify-between",
  pagination: "",
  rangeContainer: "flex items-center gap-1",
  pageButton: "",
  pageButtonActive: "",
  ellipsis:
    "flex h-8 w-8 select-none items-center justify-center text-sm text-kumo-subtle",
  prevButton: "",
  nextButton: "",
} as const satisfies Record<keyof PaginationClassNames, string>;

// =============================================================================
// STYLE HELPERS
// Pure functions that resolve final class strings for each part.
// =============================================================================

/**
 * Resolves the final className for a given component part by merging
 * the default style with any consumer override via cn().
 *
 * Pure function — same inputs always produce the same output.
 *
 * @param part - The component part key from PaginationClassNames.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string.
 */
function resolvePart(
  part: keyof PaginationClassNames,
  overrides?: PaginationClassNames,
): string {
  return cn(DEFAULT_STYLES[part], overrides?.[part]);
}

// =============================================================================
// INTERNAL HELPERS
// Pure functions that determine which render path to use.
// Keeps branching logic out of the component body.
// =============================================================================

/**
 * Determines whether the compound layout should be used.
 * The compound layout is required when either pageSizeOptions or
 * pageSelector="dropdown" is provided — both require Kumo's compound API.
 *
 * Pure function — no side effects.
 *
 * @param pageSizeOptions - The pageSizeOptions prop value.
 * @param pageSelector - The pageSelector prop value.
 * @returns True if the compound layout should be rendered.
 */
function shouldUseCompoundLayout(
  pageSizeOptions?: number[],
  pageSelector?: "input" | "dropdown",
): boolean {
  return !!pageSizeOptions || pageSelector === "dropdown";
}

// =============================================================================
// INTERNAL PROPS
// Shared props type used by all three internal render components.
// Defined once here to avoid repetition across sub-components.
// =============================================================================

interface InternalPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageParamName: string;
  pageSelector: "input" | "dropdown";
  resetScroll: ScrollBehavior;
  adapter: PaginationRouterAdapter;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  siblings: number;
  prevNextAs: "arrows" | "words";
  prevNextLabels?: { previous?: string; next?: string };
  classNames?: PaginationClassNames;
}

// =============================================================================
// RENDER COMPONENTS
// Each render component has one job — rendering its specific layout.
// All page logic is computed in the parent and passed as props.
// Handlers only apply — they never compute.
// =============================================================================

/**
 * Renders the range-style pagination control.
 * Shows numbered page buttons with ellipsis markers.
 * Separation of concerns: only responsible for the range layout.
 */
function RangePagination({
  currentPage,
  totalPages,
  pageParamName,
  resetScroll,
  adapter,
  onPageChange,
  siblings,
  prevNextAs,
  prevNextLabels,
  classNames,
}: InternalPaginationProps) {
  const pageRange = React.useMemo(
    () => getPageRange(currentPage, totalPages, siblings),
    [currentPage, totalPages, siblings],
  );

  const showWords = prevNextAs === "words";
  const previousLabel = prevNextLabels?.previous ?? "Previous";
  const nextLabel = prevNextLabels?.next ?? "Next";

  function handlePageChange(page: number) {
    const next = resolveNextPage(page, totalPages);
    adapter.setParam(pageParamName, String(next), resetScroll);
    onPageChange?.(next);
  }

  return (
    <div className={resolvePart("rangeContainer", classNames)}>
      <Button
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
        aria-label="Previous page"
        className={resolvePart("prevButton", classNames)}
      >
        {showWords ? previousLabel : <CaretLeftIcon size={16} />}
      </Button>

      {pageRange.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className={resolvePart("ellipsis", classNames)}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Button
            key={item}
            variant={item === currentPage ? "primary" : "ghost"}
            shape="square"
            onClick={() => handlePageChange(item)}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={
              item === currentPage
                ? resolvePart("pageButtonActive", classNames)
                : resolvePart("pageButton", classNames)
            }
          >
            {item}
          </Button>
        ),
      )}

      <Button
        variant="secondary"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        aria-label="Next page"
        className={resolvePart("nextButton", classNames)}
      >
        {showWords ? nextLabel : <CaretRightIcon size={16} />}
      </Button>
    </div>
  );
}

/**
 * Renders Kumo's compound pagination layout.
 * Used when page size dropdown or dropdown page selector is needed.
 * Separation of concerns: only responsible for the compound layout.
 */
function CompoundPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageParamName,
  pageSelector,
  resetScroll,
  adapter,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  classNames,
}: InternalPaginationProps) {
  function handlePageChange(page: number) {
    const next = resolveNextPage(page, totalPages);
    adapter.setParam(pageParamName, String(next), resetScroll);
    onPageChange?.(next);
  }

  function handlePageSizeChange(size: number) {
    adapter.setParam(pageParamName, "1", resetScroll);
    onPageSizeChange?.(size);
  }

  return (
    <KumoPagination
      page={currentPage}
      setPage={handlePageChange}
      perPage={pageSize}
      totalCount={totalItems}
      className={resolvePart("pagination", classNames)}
    >
      <KumoPagination.Info />
      <KumoPagination.Separator />
      {pageSizeOptions && (
        <KumoPagination.PageSize
          value={pageSize}
          options={pageSizeOptions}
          onChange={handlePageSizeChange}
        />
      )}
      <KumoPagination.Controls
        pageSelector={pageSelector === "dropdown" ? "dropdown" : "input"}
      />
    </KumoPagination>
  );
}

/**
 * Renders Kumo's native pagination component.
 * Used for full and simple control modes without a page size dropdown.
 * Separation of concerns: only responsible for the native layout.
 */
function NativePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageParamName,
  controls,
  resetScroll,
  adapter,
  onPageChange,
  classNames,
}: InternalPaginationProps & { controls: "full" | "simple" }) {
  function handlePageChange(page: number) {
    const next = resolveNextPage(page, totalPages);
    adapter.setParam(pageParamName, String(next), resetScroll);
    onPageChange?.(next);
  }

  return (
    <KumoPagination
      page={currentPage}
      setPage={handlePageChange}
      perPage={pageSize}
      totalCount={totalItems}
      controls={controls}
      className={resolvePart("pagination", classNames)}
    />
  );
}

// =============================================================================
// COMPONENT
// Responsible only for resolving shared state and delegating to the correct
// render component. Contains no layout or UI logic of its own.
// =============================================================================

/**
 * Pagination control that manages a page URL parameter.
 *
 * Wraps Kumo's Pagination component and connects it to the URL so the
 * current page is always reflected in the URL — making it shareable,
 * bookmarkable, and compatible with server-side pagination.
 *
 * Stays router-agnostic via the `adapter` prop. Use `onPageChange` to
 * trigger server-side data refetching when the page changes.
 *
 * Use `classNames` to override styles — always use Kumo semantic color
 * tokens instead of raw Tailwind colors.
 *
 * ---
 *
 * **Control modes (`controls` prop):**
 * - `"full"` — Kumo's full controls with page input or dropdown (default)
 * - `"simple"` — Kumo's minimal prev/next controls
 * - `"range"` — Custom `‹ 1 … 4 5 6 … 10 ›` range display
 *
 * **Page selector (`pageSelector` prop):**
 * - `"input"` — text input for typing a page number (default)
 * - `"dropdown"` — dropdown showing all available pages
 * - Only applies to `"full"` and `"simple"` modes
 * - Automatically uses Kumo's compound layout when set to `"dropdown"`
 *
 * **Page size dropdown (`pageSizeOptions` prop):**
 * - Renders a page size selector alongside the controls
 * - Only applies to `"full"` and `"simple"` modes
 * - Can be combined with `pageSelector="dropdown"`
 *
 * **Word-based prev/next (`prevNextAs` prop):**
 * - Only applies to `"range"` mode
 *
 * **Siblings (`siblings` prop):**
 * - Controls page buttons shown on each side of current page
 * - Only applies to `"range"` mode
 *
 * @remarks
 * **TanStack Router users:** The route where this component is used must
 * declare its search params via `validateSearch`. This is a TanStack Router
 * requirement, not a Pagination requirement.
 *
 * ```tsx
 * export const Route = createFileRoute('/users')({
 *   validateSearch: z.object({
 *     page: z.coerce.number().optional(),
 *   }),
 *   component: UsersPage,
 * })
 * ```
 *
 * TanStack Router's strict global type intersection may cause type errors
 * in the adapter's navigate calls. Using `as any` on the search callback
 * return is expected and acceptable:
 *
 * ```tsx
 * setParam: (key, value) =>
 *   router.navigate({
 *     from: '/your-route',
 *     search: (prev) => ({ ...prev, [key]: value }) as any,
 *   }),
 * ```
 *
 * @example Basic
 * ```tsx
 * <Pagination adapter={adapter} totalItems={100} />
 * ```
 *
 * @example Server-side pagination
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={totalUsers}
 *   pageSize={20}
 *   onPageChange={(page) => refetch({ page })}
 * />
 * ```
 *
 * @example With page size dropdown
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   pageSize={pageSize}
 *   pageSizeOptions={[10, 20, 50]}
 *   onPageSizeChange={(size) => setPageSize(size)}
 * />
 * ```
 *
 * @example With dropdown page selector
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   pageSelector="dropdown"
 * />
 * ```
 *
 * @example With both page size and dropdown selector
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   pageSize={pageSize}
 *   pageSizeOptions={[10, 20, 50]}
 *   onPageSizeChange={(size) => setPageSize(size)}
 *   pageSelector="dropdown"
 * />
 * ```
 *
 * @example Range mode with arrow buttons
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   controls="range"
 * />
 * ```
 *
 * @example Range mode with word labels
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   controls="range"
 *   prevNextAs="words"
 *   prevNextLabels={{ previous: "Prev", next: "Next" }}
 * />
 * ```
 *
 * @example Range mode with siblings
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   controls="range"
 *   siblings={2}
 * />
 * ```
 *
 * @example With scroll reset
 * ```tsx
 * <Pagination adapter={adapter} totalItems={100} resetScroll="smooth" />
 * ```
 *
 * @example With style overrides
 * ```tsx
 * <Pagination
 *   adapter={adapter}
 *   totalItems={100}
 *   classNames={{ root: "mt-6 justify-center" }}
 * />
 * ```
 */
export function Pagination({
  adapter,
  totalItems,
  pageSize = 20,
  pageParamName = "page",
  controls = "full",
  pageSelector = "input",
  resetScroll = false,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  siblings = 1,
  prevNextAs = "arrows",
  prevNextLabels,
  classNames,
}: PaginationProps) {
  const rawParam = adapter.getParam(pageParamName);
  const params = buildParamsFromRaw(pageParamName, rawParam);
  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = clampPage(
    getPageParam(params, pageParamName),
    totalPages,
  );

  const internalProps: InternalPaginationProps = {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    pageParamName,
    pageSelector,
    resetScroll,
    adapter,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    siblings,
    prevNextAs,
    prevNextLabels,
    classNames,
  };

  return (
    <nav aria-label="Pagination" className={resolvePart("root", classNames)}>
      {controls === "range" ? (
        <RangePagination {...internalProps} />
      ) : shouldUseCompoundLayout(pageSizeOptions, pageSelector) ? (
        <CompoundPagination {...internalProps} />
      ) : (
        <NativePagination {...internalProps} controls={controls} />
      )}
    </nav>
  );
}
