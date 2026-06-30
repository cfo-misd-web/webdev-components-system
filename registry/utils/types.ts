// =============================================================================
// SHARED TYPES
// Types shared across multiple registry components.
// Import from here instead of from individual components.
// =============================================================================

/**
 * Controls scroll behavior when a URL param updates.
 * - `false` — no scroll reset, page stays in place (default)
 * - `true` — scrolls to top instantly
 * - `"smooth"` — scrolls to top smoothly
 */
export type ScrollBehavior = false | true | "smooth";
