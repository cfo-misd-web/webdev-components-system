"use client";

import * as React from "react";
import { InputGroup } from "@cloudflare/kumo";
import { CheckIcon, XIcon, EyeSlashIcon, EyeIcon } from "@phosphor-icons/react";
import { validatePassword, buildRules } from "@/lib/password-input/validation";
import type { PasswordRuleset } from "@/lib/password-input/validation";
import { cn } from "@/lib/cn";
import { extractInputValue } from "@/lib/dom";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Style overrides for each distinct visual part of the PasswordInput component.
 * All keys are optional — only override what you need.
 * Values are Tailwind class strings merged on top of defaults via cn().
 *
 * Note: The input and toggle button are rendered by Kumo's InputGroup
 * and are not directly styleable. Use `inputGroup` to style the
 * InputGroup wrapper itself.
 *
 * Always use Kumo semantic color tokens (e.g. `text-kumo-success`) instead
 * of raw Tailwind colors to ensure light/dark mode compatibility.
 *
 * @example
 * ```tsx
 * classNames={{
 *   root: "w-full max-w-sm",
 *   inputGroup: "shadow-sm",
 *   checklist: "mt-2",
 *   checklistItem: "gap-3",
 *   checklistItemPassed: "text-kumo-success",
 *   checklistItemFailed: "text-kumo-subtle",
 *   checklistIcon: "size-3",
 *   checklistLabel: "font-medium",
 * }}
 * ```
 */
export interface PasswordInputClassNames {
  /** The outermost wrapper div containing the input group and checklist. */
  root?: string;
  /** The Kumo InputGroup component wrapper. */
  inputGroup?: string;
  /** The ul element wrapping all checklist rule items. */
  checklist?: string;
  /** Each individual li rule item in the checklist. */
  checklistItem?: string;
  /** Applied to a rule item when the rule has been satisfied. */
  checklistItemPassed?: string;
  /** Applied to a rule item when the rule has not yet been satisfied. */
  checklistItemFailed?: string;
  /** The icon (check or x) shown next to each rule item. */
  checklistIcon?: string;
  /** The text label of each rule item. */
  checklistLabel?: string;
}

/**
 * Props for the PasswordInput component.
 */
export interface PasswordInputProps {
  /**
   * The current value of the password input.
   * Pair with `onChange` for controlled usage.
   */
  value: string;

  /**
   * Callback fired whenever the password value changes.
   * @param value - The updated password string.
   */
  onChange: (value: string) => void;

  /**
   * Label displayed above the input field.
   * Passed directly to Kumo's InputGroup.
   * Also used as the accessible name for the input.
   * @optional
   * @example "Password"
   */
  label?: string;

  /**
   * Helper text displayed below the input.
   * Hidden when `error` is present.
   * Passed directly to Kumo's InputGroup.
   * @optional
   * @example "Must be at least 8 characters"
   */
  description?: React.ReactNode;

  /**
   * Error message string displayed below the input.
   * When provided, puts the input into error state.
   * @optional
   * @example "Password is required"
   */
  error?: string;

  /**
   * When explicitly `false`, shows "(optional)" text after the label.
   * When `true` or `undefined`, no indicator is shown.
   * Passed directly to Kumo's InputGroup.
   * @optional
   */
  required?: boolean;

  /**
   * Tooltip content displayed next to the label via an info icon.
   * Passed directly to Kumo's InputGroup.
   * @optional
   * @example "Your password must meet the requirements below"
   */
  labelTooltip?: React.ReactNode;

  /**
   * Size of the input field.
   * Passed directly to Kumo's InputGroup.
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
   * Placeholder text for the input.
   * @optional
   */
  placeholder?: string;

  /**
   * Optional password validation ruleset.
   *
   * When provided, a live checklist renders below the input.
   * Each rule shows a check when satisfied and updates in real
   * time as the user types.
   *
   * Supports predefined rules (length, character types) and fully
   * custom rules via the `customRules` array.
   *
   * @optional
   * @example
   * ```tsx
   * <PasswordInput
   *   value={password}
   *   onChange={setPassword}
   *   ruleset={{
   *     length: { min: 8, max: 32 },
   *     required: {
   *       uppercase: true,
   *       lowercase: true,
   *       number: true,
   *       special: true,
   *     },
   *     customRules: [
   *       {
   *         label: "Cannot contain spaces",
   *         validate: (p) => !p.includes(" "),
   *       },
   *     ],
   *   }}
   * />
   * ```
   */
  ruleset?: PasswordRuleset;

  /**
   * Tailwind class overrides for each visual part of the component.
   *
   * Classes are merged on top of defaults using cn() (clsx + tailwind-merge),
   * so conflicting utilities are resolved correctly.
   *
   * Always use Kumo semantic color tokens instead of raw Tailwind colors
   * to ensure light/dark mode compatibility.
   *
   * @optional
   * @example
   * ```tsx
   * <PasswordInput
   *   value={password}
   *   onChange={setPassword}
   *   classNames={{
   *     root: "w-full max-w-sm",
   *     checklistItemPassed: "text-kumo-success",
   *     checklistItemFailed: "text-kumo-subtle",
   *     checklistIcon: "size-3",
   *     checklistLabel: "font-medium",
   *   }}
   * />
   * ```
   */
  classNames?: PasswordInputClassNames;
}

// =============================================================================
// DEFAULT STYLES
// Pure style data for each styleable part of the component.
// Separated from component logic so styles can be read and reasoned
// about independently of rendering.
// All colors use Kumo semantic tokens for light/dark mode compatibility.
// =============================================================================

/**
 * Default Tailwind styles for each named part of the component.
 * Consumer classNames are merged on top via cn().
 * All colors use Kumo semantic tokens.
 */
const DEFAULT_STYLES = {
  root: "flex flex-col gap-2",
  inputGroup: "",
  checklist: "flex flex-col gap-1 px-1",
  checklistItem: "flex items-center gap-2 text-xs transition-colors",
  checklistItemPassed: "text-kumo-success",
  checklistItemFailed: "text-kumo-subtle",
  checklistIcon: "",
  checklistLabel: "",
} as const satisfies Record<keyof PasswordInputClassNames, string>;

// =============================================================================
// STYLE HELPERS
// Pure functions that resolve final class strings for each part.
// Separated from the component so style logic stays testable.
// =============================================================================

/**
 * Resolves the final className for a given component part by merging
 * the default style with any consumer override via cn().
 *
 * Pure function — same inputs always produce the same output.
 *
 * @param part - The component part key from PasswordInputClassNames.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string.
 */
function resolvePart(
  part: keyof PasswordInputClassNames,
  overrides?: PasswordInputClassNames,
): string {
  return cn(DEFAULT_STYLES[part], overrides?.[part]);
}

/**
 * Resolves the className for a checklist item li based on whether
 * the rule has passed or not.
 *
 * Pure function — no side effects.
 *
 * @param passed - Whether the rule has been satisfied.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string for the item.
 */
function resolveChecklistItem(
  passed: boolean,
  overrides?: PasswordInputClassNames,
): string {
  return cn(
    DEFAULT_STYLES.checklistItem,
    overrides?.checklistItem,
    passed
      ? cn(DEFAULT_STYLES.checklistItemPassed, overrides?.checklistItemPassed)
      : cn(DEFAULT_STYLES.checklistItemFailed, overrides?.checklistItemFailed),
  );
}

// =============================================================================
// INTERNAL HELPERS
// Pure functions that transform props into the shapes Kumo expects internally.
// Keeps Kumo-specific types out of the public API.
// =============================================================================

/**
 * Transforms a plain error string into the shape Kumo's InputGroup expects.
 * Returns undefined if no error is provided.
 *
 * Pure function — no side effects.
 *
 * @param error - Optional error string from the consumer.
 * @returns Kumo-compatible error object or undefined.
 */
function resolveError(
  error?: string,
): { message: React.ReactNode; match: "customError" } | undefined {
  if (!error) return undefined;
  return { message: error, match: "customError" };
}

/**
 * Resolves the accessible name for the input element.
 * Uses the label string if provided, otherwise falls back to "Password".
 *
 * Pure function — no side effects.
 *
 * @param label - The label prop from the consumer.
 * @returns A string suitable for aria-label.
 */
function resolveAriaLabel(label?: string): string {
  return label ?? "Password";
}

// =============================================================================
// COMPONENT
// Responsible only for rendering — all logic lives in validation.ts,
// all style decisions live in the helpers above.
// =============================================================================

/**
 * Password input with a show/hide toggle and optional live validation checklist.
 *
 * When a `ruleset` is provided, each rule appears as a checklist item below
 * the input and turns green as the user satisfies it.
 *
 * Use `classNames` to override the Tailwind styles of any individual part
 * of the component — classes are merged on top of defaults, so you only
 * need to specify what you want to change. Always use Kumo semantic color
 * tokens (e.g. `text-kumo-success`) instead of raw Tailwind colors.
 *
 * @example Basic
 * ```tsx
 * <PasswordInput value={password} onChange={setPassword} />
 * ```
 *
 * @example With ruleset
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChange={setPassword}
 *   ruleset={{
 *     length: { min: 8 },
 *     required: { uppercase: true, number: true, special: true },
 *     customRules: [{ label: "No spaces", validate: (p) => !p.includes(" ") }],
 *   }}
 * />
 * ```
 *
 * @example With style overrides
 * ```tsx
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChange={setPassword}
 *   classNames={{
 *     checklistItemPassed: "text-kumo-success",
 *     checklistIcon: "size-3",
 *     checklistLabel: "font-medium",
 *   }}
 * />
 * ```
 */
export function PasswordInput({
  value,
  onChange,
  label,
  description,
  error,
  required,
  labelTooltip,
  size = "base",
  disabled,
  placeholder,
  ruleset,
  classNames,
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  const rules = React.useMemo(
    () => (ruleset ? buildRules(ruleset) : []),
    [ruleset],
  );

  const validation = React.useMemo(
    () => (rules.length > 0 ? validatePassword(value, rules) : null),
    [value, rules],
  );

  return (
    <div className={resolvePart("root", classNames)}>
      <InputGroup
        label={label}
        description={description}
        error={resolveError(error)}
        required={required}
        labelTooltip={labelTooltip}
        size={size}
        disabled={disabled}
        className={resolvePart("inputGroup", classNames)}
      >
        <InputGroup.Input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(extractInputValue(e))}
          placeholder={placeholder}
          aria-label={resolveAriaLabel(label)}
        />
        <InputGroup.Addon align="end">
          <InputGroup.Button
            variant="ghost"
            tooltip={visible ? "Hide password" : "Show password"}
            tooltipSide="top"
            aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup>

      {validation && validation.rules.length > 0 && (
        <ul
          aria-live="polite"
          aria-label="Password requirements"
          className={resolvePart("checklist", classNames)}
        >
          {validation.rules.map((rule) => (
            <li
              key={rule.label}
              className={resolveChecklistItem(rule.passed, classNames)}
            >
              <span className={resolvePart("checklistIcon", classNames)}>
                {rule.passed ? (
                  <CheckIcon size={12} weight="bold" />
                ) : (
                  <XIcon size={12} />
                )}
              </span>
              <span className={resolvePart("checklistLabel", classNames)}>
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
