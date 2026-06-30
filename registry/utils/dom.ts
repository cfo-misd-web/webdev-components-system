import * as React from "react";

// =============================================================================
// DOM UTILITIES
// Shared pure functions for working with DOM events.
// Import from here instead of duplicating across components.
// =============================================================================

/**
 * Extracts the string value from a React input change event.
 *
 * Pure function — no side effects. Separates the extraction concern
 * from the side effects (state updates, callbacks) that follow it
 * in the event handler.
 *
 * @param e - The React input change event.
 * @returns The current string value of the input element.
 *
 * @example
 * ```ts
 * function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
 *   const value = extractInputValue(e)
 *   setValue(value)
 *   doSomethingWith(value)
 * }
 * ```
 */
export function extractInputValue(
  e: React.ChangeEvent<HTMLInputElement>,
): string {
  return e.target.value;
}
