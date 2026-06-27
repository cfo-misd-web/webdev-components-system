"use client";

import * as React from "react";
import { InputGroup } from "@cloudflare/kumo";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { createDebounce } from "@/lib/search-bar/validation";
import { cn } from "@/lib/cn";
import type { ScrollBehavior } from "@/lib/types";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Adapter interface for reading and writing URL search params.
 *
 * Inject this to make the SearchBar work with any router.
 * The component never touches the URL directly — it calls these functions.
 *
 * @example TanStack Router
 * ```tsx
 * const router = useRouter()
 * const search = useSearch({ from: '/your-route' })
 * const searchParams = search as Record<string, string | undefined>
 *
 * const adapter: SearchBarRouterAdapter = {
 *   getParam: (key) => searchParams[key] ?? "",
 *   setParam: (key, value, resetScroll) =>
 *     router.navigate({
 *       from: '/your-route',
 *       resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
 *       search: (prev) => ({ ...prev, [key]: value }) as any,
 *     }).then(() => {
 *       if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *     }),
 *   clearParam: (key, resetScroll) =>
 *     router.navigate({
 *       from: '/your-route',
 *       resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
 *       search: (prev) => {
 *         const next = { ...prev } as Record<string, string | undefined>
 *         delete next[key]
 *         return next as any
 *       },
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
 * const adapter: SearchBarRouterAdapter = {
 *   getParam: (paramName) => searchParams.get(paramName) ?? "",
 *   setParam: (paramName, value, resetScroll) => {
 *     const params = setSearchParam(new URLSearchParams(searchParams.toString()), paramName, value)
 *     router.push(`?${params.toString()}`)
 *     if (resetScroll === true) window.scrollTo({ top: 0 })
 *     if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *   },
 *   clearParam: (paramName, resetScroll) => {
 *     const params = clearSearchParam(new URLSearchParams(searchParams.toString()), paramName)
 *     router.push(`?${params.toString()}`)
 *     if (resetScroll === true) window.scrollTo({ top: 0 })
 *     if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *   },
 * }
 * ```
 */
export interface SearchBarRouterAdapter {
  /**
   * Reads the current value of a URL search param.
   * @param paramName - The param key to read.
   * @returns The current value or empty string if not set.
   */
  getParam: (paramName: string) => string;

  /**
   * Sets a URL search param to the given value.
   * @param paramName - The param key to set.
   * @param value - The value to set.
   * @param resetScroll - Optional scroll behavior after update.
   */
  setParam: (
    paramName: string,
    value: string,
    resetScroll?: ScrollBehavior,
  ) => void;

  /**
   * Clears a URL search param entirely.
   * @param paramName - The param key to remove.
   * @param resetScroll - Optional scroll behavior after clear.
   */
  clearParam: (paramName: string, resetScroll?: ScrollBehavior) => void;
}

/**
 * Style overrides for each distinct visual part of the SearchBar component.
 * All keys are optional — only override what you need.
 * Values are Tailwind class strings merged on top of defaults via cn().
 *
 * Always use Kumo semantic color tokens (e.g. `text-kumo-subtle`) instead
 * of raw Tailwind colors to ensure light/dark mode compatibility.
 *
 * @example
 * ```tsx
 * classNames={{
 *   root: "w-full max-w-md",
 *   inputGroup: "shadow-sm",
 *   clearButton: "text-kumo-danger",
 * }}
 * ```
 */
export interface SearchBarClassNames {
  /** The outermost wrapper div. */
  root?: string;
  /** The Kumo InputGroup wrapper. */
  inputGroup?: string;
  /** The clear (X) button shown when the input has a value. */
  clearButton?: string;
}

/**
 * Props for the SearchBar component.
 */
export interface SearchBarProps {
  /**
   * Adapter that connects the SearchBar to your router.
   * Provides getParam, setParam, and clearParam functions
   * so the component stays router-agnostic.
   *
   * @example TanStack Router adapter
   * ```tsx
   * const adapter: SearchBarRouterAdapter = {
   *   getParam: (key) => searchParams[key] ?? "",
   *   setParam: (key, value, resetScroll) =>
   *     router.navigate({
   *       from: '/your-route',
   *       resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
   *       search: (prev) => ({ ...prev, [key]: value }) as any,
   *     }).then(() => {
   *       if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
   *     }),
   *   clearParam: (key, resetScroll) =>
   *     router.navigate({
   *       from: '/your-route',
   *       resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
   *       search: (prev) => {
   *         const next = { ...prev } as Record<string, string | undefined>
   *         delete next[key]
   *         return next as any
   *       },
   *     }).then(() => {
   *       if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
   *     }),
   * }
   * ```
   */
  adapter: SearchBarRouterAdapter;

  /**
   * The URL search parameter key used to store the search query.
   * @default "search"
   * @example "q" | "query" | "keyword"
   */
  paramName?: string;

  /**
   * Debounce delay in milliseconds before the URL param is updated.
   * Set to 0 to disable debouncing.
   * @default 300
   */
  debounceMs?: number;

  /**
   * Placeholder text for the search input.
   * @optional
   * @default "Search..."
   */
  placeholder?: string;

  /**
   * Label for the search input. Used for accessibility.
   * @optional
   * @default "Search"
   */
  label?: string;

  /**
   * Size of the input field.
   * @optional
   * @default "base"
   */
  size?: "xs" | "sm" | "base" | "lg";

  /**
   * Whether the input is disabled.
   * @optional
   */
  disabled?: boolean;

  /**
   * When true, shows a clear (X) button inside the input
   * when the search query is not empty.
   * @optional
   * @default false
   */
  clearable?: boolean;

  /**
   * Controls scroll behavior when the URL param updates.
   * - `false` — no scroll reset, page stays in place (default)
   * - `true` — scrolls to top instantly on each update
   * - `"smooth"` — scrolls to top smoothly on each update
   *
   * @optional
   * @default false
   *
   * @example
   * ```tsx
   * <SearchBar adapter={adapter} resetScroll="smooth" />
   * ```
   */
  resetScroll?: ScrollBehavior;

  /**
   * Optional callback fired after the URL param is updated.
   * Use this to trigger server-side data refetching.
   *
   * @optional
   * @param value - The current search query after debounce.
   *
   * @example Server-side search
   * ```tsx
   * <SearchBar
   *   adapter={adapter}
   *   onSearch={(query) => refetch({ search: query })}
   * />
   * ```
   */
  onSearch?: (value: string) => void;

  /**
   * Tailwind class overrides for each visual part of the component.
   * Always use Kumo semantic color tokens instead of raw Tailwind colors.
   *
   * @optional
   * @example
   * ```tsx
   * classNames={{
   *   root: "w-full max-w-md",
   *   clearButton: "text-kumo-danger",
   * }}
   * ```
   */
  classNames?: SearchBarClassNames;
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
  root: "w-full",
  inputGroup: "",
  clearButton: "text-kumo-subtle hover:text-kumo-default",
} as const satisfies Record<keyof SearchBarClassNames, string>;

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
 * @param part - The component part key from SearchBarClassNames.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string.
 */
function resolvePart(
  part: keyof SearchBarClassNames,
  overrides?: SearchBarClassNames,
): string {
  return cn(DEFAULT_STYLES[part], overrides?.[part]);
}

// =============================================================================
// COMPONENT
// Responsible only for rendering — all URL logic lives in validation.ts,
// all style decisions live in the helpers above.
// =============================================================================

/**
 * Search input that manages a URL search parameter.
 *
 * Updates the URL param as the user types (debounced) so the search
 * query is always reflected in the URL — making it shareable, bookmarkable,
 * and compatible with server-side filtering.
 *
 * Stays router-agnostic via the `adapter` prop — works with TanStack Router,
 * Next.js, or any other router. Use `onSearch` to trigger server-side
 * data refetching after the URL param updates.
 *
 * Use `classNames` to override the Tailwind styles of any individual part
 * of the component — classes are merged on top of defaults, so you only
 * need to specify what you want to change. Always use Kumo semantic color
 * tokens (e.g. `text-kumo-subtle`) instead of raw Tailwind colors.
 *
 * @remarks
 * **TanStack Router users:** The route where this component is used must
 * declare its search params via `validateSearch`. This is a TanStack Router
 * requirement, not a SearchBar requirement — any route that reads search
 * params needs this regardless of whether SearchBar is used.
 *
 * ```tsx
 * export const Route = createFileRoute('/users')({
 *   validateSearch: z.object({
 *     search: z.string().optional(),
 *   }),
 *   component: UsersPage,
 * })
 * ```
 *
 * Additionally, TanStack Router's strict global type intersection may cause
 * type errors in the adapter's navigate calls. Using `as any` on the search
 * callback return is expected and acceptable in this case:
 *
 * ```tsx
 * setParam: (key, value) =>
 *   router.navigate({
 *     from: '/your-route',
 *     search: (prev) => ({ ...prev, [key]: value }) as any,
 *   }),
 * ```
 *
 * @example TanStack Router — client-side
 * ```tsx
 * const router = useRouter()
 * const search = useSearch({ from: '/your-route' })
 * const searchParams = search as Record<string, string | undefined>
 *
 * <SearchBar
 *   adapter={{
 *     getParam: (key) => searchParams[key] ?? "",
 *     setParam: (key, value, resetScroll) =>
 *       router.navigate({
 *         from: '/your-route',
 *         resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
 *         search: (prev) => ({ ...prev, [key]: value }) as any,
 *       }).then(() => {
 *         if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *       }),
 *     clearParam: (key, resetScroll) =>
 *       router.navigate({
 *         from: '/your-route',
 *         resetScroll: resetScroll === "smooth" ? false : (resetScroll ?? false),
 *         search: (prev) => {
 *           const next = { ...prev } as Record<string, string | undefined>
 *           delete next[key]
 *           return next as any
 *         },
 *       }).then(() => {
 *         if (resetScroll === "smooth") window.scrollTo({ top: 0, behavior: "smooth" })
 *       }),
 *   }}
 *   clearable
 * />
 * ```
 *
 * @example With server-side search
 * ```tsx
 * <SearchBar
 *   adapter={adapter}
 *   onSearch={(query) => refetch({ search: query })}
 * />
 * ```
 *
 * @example Custom param name
 * ```tsx
 * <SearchBar adapter={adapter} paramName="q" />
 * ```
 *
 * @example With scroll reset
 * ```tsx
 * <SearchBar adapter={adapter} resetScroll="smooth" />
 * <SearchBar adapter={adapter} resetScroll={true} />
 * <SearchBar adapter={adapter} resetScroll={false} />
 * ```
 *
 * @example With style overrides
 * ```tsx
 * <SearchBar
 *   adapter={adapter}
 *   classNames={{ root: "max-w-md", clearButton: "text-kumo-danger" }}
 * />
 * ```
 */
export function SearchBar({
  adapter,
  paramName = "search",
  debounceMs = 300,
  placeholder = "Search...",
  label = "Search",
  size = "base",
  disabled = false,
  clearable = false,
  resetScroll = false,
  onSearch,
  classNames,
}: SearchBarProps) {
  const currentValue = adapter.getParam(paramName);
  const [inputValue, setInputValue] = React.useState(currentValue);

  const debouncedUpdate = React.useMemo(
    () =>
      createDebounce((value: string) => {
        adapter.setParam(paramName, value, resetScroll);
        onSearch?.(value);
      }, debounceMs),
    [adapter, paramName, debounceMs, onSearch, resetScroll],
  );

  React.useEffect(() => {
    return () => debouncedUpdate.cancel();
  }, [debouncedUpdate]);

  React.useEffect(() => {
    setInputValue(currentValue);
  }, [currentValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    debouncedUpdate(value);
  }

  function handleClear() {
    setInputValue("");
    adapter.clearParam(paramName, resetScroll);
    onSearch?.("");
  }

  const showClear = clearable && inputValue.length > 0;

  return (
    <div className={resolvePart("root", classNames)}>
      <InputGroup
        size={size}
        disabled={disabled}
        className={resolvePart("inputGroup", classNames)}
      >
        <InputGroup.Addon>
          <MagnifyingGlassIcon size={16} className="text-kumo-subtle" />
        </InputGroup.Addon>
        <InputGroup.Input
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={label}
        />
        {showClear && (
          <InputGroup.Addon align="end">
            <InputGroup.Button
              variant="ghost"
              tooltip="Clear search"
              tooltipSide="top"
              aria-label="Clear search"
              onClick={handleClear}
              className={resolvePart("clearButton", classNames)}
            >
              <XIcon size={16} />
            </InputGroup.Button>
          </InputGroup.Addon>
        )}
      </InputGroup>
    </div>
  );
}
