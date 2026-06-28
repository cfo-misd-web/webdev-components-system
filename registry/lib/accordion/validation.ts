import { z } from "zod";

// =============================================================================
// SCHEMA
// Zod schema defining the shape of the Accordion configuration.
// =============================================================================

/**
 * Configuration schema for the Accordion component.
 *
 * @example
 * ```ts
 * const config: AccordionConfig = {
 *   type: "single",
 *   collapsible: true,
 *   animate: true,
 * }
 * ```
 */
export const AccordionConfigSchema = z.object({
  /**
   * Whether one or multiple items can be open simultaneously.
   * @default "single"
   */
  type: z.enum(["single", "multiple"]).default("single"),

  /**
   * Whether clicking an open item in single mode closes it.
   * Only applies to type="single".
   * @default true
   */
  collapsible: z.boolean().default(true),

  /**
   * Whether opening and closing items is animated smoothly.
   * When false, panels appear and disappear instantly.
   * @default true
   */
  animate: z.boolean().default(true),
});

export type AccordionConfig = z.infer<typeof AccordionConfigSchema>;

// =============================================================================
// STATE HELPERS
// Pure functions for computing the next open state.
// The component never computes state directly — it calls these.
// Each function returns a new value without mutating the input.
// =============================================================================

/**
 * Resolves the next open value for single mode.
 * Clicking the open item either closes it (collapsible=true) or keeps
 * it open (collapsible=false). Clicking a different item always opens it.
 *
 * Pure function — no side effects.
 *
 * @param current - The currently open item value, or undefined if none.
 * @param clicked - The value of the item that was clicked.
 * @param collapsible - Whether clicking the open item should close it.
 * @returns The next open value, or undefined if no item should be open.
 *
 * @example
 * ```ts
 * resolveNextSingleValue("item1", "item1", true)   // → undefined (closes)
 * resolveNextSingleValue("item1", "item1", false)  // → "item1" (stays open)
 * resolveNextSingleValue("item1", "item2", true)   // → "item2" (switches)
 * resolveNextSingleValue(undefined, "item1", true) // → "item1" (opens)
 * ```
 */
export function resolveNextSingleValue(
  current: string | undefined,
  clicked: string,
  collapsible: boolean,
): string | undefined {
  if (current === clicked) return collapsible ? undefined : clicked;
  return clicked;
}

/**
 * Resolves the next open values for multiple mode.
 * Toggles the clicked item — adds it if closed, removes it if open.
 *
 * Pure function — no side effects.
 *
 * @param current - The currently open item values.
 * @param clicked - The value of the item that was clicked.
 * @returns A new array with the clicked item toggled.
 *
 * @example
 * ```ts
 * resolveNextMultipleValue(["item1"], "item2")          // → ["item1", "item2"]
 * resolveNextMultipleValue(["item1", "item2"], "item1") // → ["item2"]
 * resolveNextMultipleValue([], "item1")                 // → ["item1"]
 * ```
 */
export function resolveNextMultipleValue(
  current: string[],
  clicked: string,
): string[] {
  if (current.includes(clicked)) {
    return current.filter((v) => v !== clicked);
  }
  return [...current, clicked];
}

/**
 * Returns whether a given item is currently open.
 *
 * Pure function — no side effects.
 *
 * @param itemValue - The value of the item to check.
 * @param openValues - The currently open item values.
 * @returns True if the item is open.
 *
 * @example
 * ```ts
 * isItemOpen("item1", ["item1", "item2"]) // → true
 * isItemOpen("item3", ["item1", "item2"]) // → false
 * ```
 */
export function isItemOpen(itemValue: string, openValues: string[]): boolean {
  return openValues.includes(itemValue);
}

/**
 * Normalizes a value to a string array for internal state representation.
 * The Accordion stores open values as string[] internally regardless of mode.
 *
 * Pure function — no side effects.
 *
 * @param value - A string, string array, or undefined.
 * @returns A string array. Returns empty array for undefined.
 *
 * @example
 * ```ts
 * normalizeToArray("item1")              // → ["item1"]
 * normalizeToArray(["item1", "item2"])   // → ["item1", "item2"]
 * normalizeToArray(undefined)            // → []
 * ```
 */
export function normalizeToArray(
  value: string | string[] | undefined,
): string[] {
  if (value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

/**
 * Converts internal string[] state back to the external API format.
 * Single mode returns the first value or undefined.
 * Multiple mode returns the full array.
 *
 * Pure function — no side effects.
 *
 * @param values - The internal open values array.
 * @param type - The accordion mode.
 * @returns The value in the format expected by the external API.
 *
 * @example
 * ```ts
 * denormalizeValue(["item1"], "single")            // → "item1"
 * denormalizeValue([], "single")                   // → undefined
 * denormalizeValue(["item1", "item2"], "multiple") // → ["item1", "item2"]
 * ```
 */
export function denormalizeValue(
  values: string[],
  type: "single" | "multiple",
): string | string[] | undefined {
  if (type === "single") return values[0];
  return values;
}
