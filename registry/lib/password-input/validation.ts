import { z } from "zod";

// =============================================================================
// RULESET SCHEMA
// Defines the shape and types of the password ruleset configuration.
// This is the public API that consumers use to configure the component.
// =============================================================================

/**
 * Defines the length constraints for a password.
 */
const LengthSchema = z.object({
  /**
   * Minimum number of characters required.
   * @example 8
   */
  min: z.number().optional(),
  /**
   * Maximum number of characters allowed.
   * @example 32
   */
  max: z.number().optional(),
});

/**
 * Defines which character types are required in the password.
 */
const RequiredSchema = z.object({
  /**
   * Requires at least one uppercase letter (A-Z).
   * @example true
   */
  uppercase: z.boolean().optional(),
  /**
   * Requires at least one lowercase letter (a-z).
   * @example true
   */
  lowercase: z.boolean().optional(),
  /**
   * Requires at least one numeric digit (0-9).
   * @example true
   */
  number: z.boolean().optional(),
  /**
   * Requires at least one special character (e.g. !@#$%^&*).
   * @example true
   */
  special: z.boolean().optional(),
});

/**
 * Defines which characters are allowed in the password.
 */
const AllowedSchema = z.object({
  /**
   * A string pattern of allowed characters using regex character class syntax.
   * @example "a-zA-Z0-9!@#$"
   */
  characters: z.string().optional(),
});

/**
 * A single custom rule defined by the consumer.
 * Use this when the predefined rules don't cover your specific requirements.
 *
 * @example
 * ```ts
 * {
 *   label: "Cannot contain your username",
 *   validate: (password) => !password.includes(username)
 * }
 * ```
 */
const CustomRuleSchema = z.object({
  /**
   * Human-readable label shown in the checklist.
   * @example "Cannot contain spaces"
   */
  label: z.string(),
  /**
   * A pure function that receives the password and returns
   * true if the rule passes, false otherwise.
   * @param password - The current password string.
   * @returns true if the rule is satisfied.
   */
  validate: z.custom<(password: string) => boolean>(),
});

/**
 * Configuration object for password validation rules.
 * Pass this to the `ruleset` prop of `PasswordInput` to enable
 * a live checklist that updates as the user types.
 *
 * Predefined rules cover the most common requirements.
 * Use `customRules` for anything more specific.
 *
 * @example
 * ```tsx
 * const ruleset: PasswordRuleset = {
 *   length: { min: 8, max: 32 },
 *   required: {
 *     uppercase: true,
 *     lowercase: true,
 *     number: true,
 *     special: true,
 *   },
 *   customRules: [
 *     {
 *       label: "Cannot contain spaces",
 *       validate: (password) => !password.includes(" "),
 *     },
 *   ],
 * }
 * ```
 */
export const PasswordRulesetSchema = z.object({
  /** Length constraints for the password. */
  length: LengthSchema.optional(),
  /** Character type requirements. */
  required: RequiredSchema.optional(),
  /** Allowed character restrictions. */
  allowed: AllowedSchema.optional(),
  /**
   * Additional custom rules beyond the predefined ones.
   * Each rule needs a label and a validate function.
   * Custom rules are appended after predefined rules in the checklist.
   *
   * @example
   * ```ts
   * customRules: [
   *   {
   *     label: "Cannot contain your username",
   *     validate: (password) => !password.includes(username),
   *   },
   *   {
   *     label: "Cannot be a common password",
   *     validate: (password) => !commonPasswords.includes(password),
   *   },
   * ]
   * ```
   */
  customRules: z.array(CustomRuleSchema).optional(),
});

export type PasswordRuleset = z.infer<typeof PasswordRulesetSchema>;

// =============================================================================
// RULE DEFINITIONS
// Predefined rules as pure data — each is a label and a validate function.
// The validator does not know about these specifically. Adding or changing
// a rule here never requires touching the validator.
// =============================================================================

/**
 * A single rule — a label shown in the checklist and a
 * pure function that checks whether the rule passes.
 */
export type Rule = {
  /** Human-readable label shown in the checklist. */
  label: string;
  /**
   * Pure function that returns true if the password satisfies this rule.
   * @param password - The current password string.
   */
  validate: (password: string) => boolean;
};

/**
 * The complete set of predefined rule definitions.
 * Each key maps to its label and validate function.
 * These are never called directly — they are activated by the rule builder.
 */
const PREDEFINED_RULES = {
  minLength: (min: number): Rule => ({
    label: `At least ${min} characters`,
    validate: (password) => password.length >= min,
  }),

  maxLength: (max: number): Rule => ({
    label: `At most ${max} characters`,
    validate: (password) => password.length <= max,
  }),

  uppercase: (): Rule => ({
    label: "At least one uppercase letter",
    validate: (password) => /[A-Z]/.test(password),
  }),

  lowercase: (): Rule => ({
    label: "At least one lowercase letter",
    validate: (password) => /[a-z]/.test(password),
  }),

  number: (): Rule => ({
    label: "At least one number",
    validate: (password) => /[0-9]/.test(password),
  }),

  special: (): Rule => ({
    label: "At least one special character",
    validate: (password) => /[^a-zA-Z0-9]/.test(password),
  }),

  allowedCharacters: (characters: string): Rule => ({
    label: `Only allowed characters: ${characters}`,
    validate: (password) => new RegExp(`^[${characters}]*$`).test(password),
  }),
} as const;

// =============================================================================
// RULE BUILDER
// Converts a PasswordRuleset config into a flat list of active Rule objects.
// This is the only place that knows about the PasswordRuleset structure.
// The validator only ever sees the output of this — a plain Rule[].
// =============================================================================

/**
 * Converts a `PasswordRuleset` configuration into a flat list of
 * active `Rule` objects ready to be run by the validator.
 *
 * Separating rule building from rule running means:
 * - The validator stays simple and rule-agnostic
 * - New predefined rules only require changes here, not in the validator
 * - The built rule list can be inspected or tested independently
 *
 * @param ruleset - The ruleset configuration provided by the consumer.
 * @returns A flat array of active `Rule` objects.
 *
 * @example
 * ```ts
 * const rules = buildRules({
 *   length: { min: 8 },
 *   required: { uppercase: true },
 * })
 * // rules[0] → { label: "At least 8 characters", validate: fn }
 * // rules[1] → { label: "At least one uppercase letter", validate: fn }
 * ```
 */
export function buildRules(ruleset: PasswordRuleset): Rule[] {
  const rules: Rule[] = [];

  if (ruleset.length?.min !== undefined) {
    rules.push(PREDEFINED_RULES.minLength(ruleset.length.min));
  }

  if (ruleset.length?.max !== undefined) {
    rules.push(PREDEFINED_RULES.maxLength(ruleset.length.max));
  }

  if (ruleset.required?.uppercase) {
    rules.push(PREDEFINED_RULES.uppercase());
  }

  if (ruleset.required?.lowercase) {
    rules.push(PREDEFINED_RULES.lowercase());
  }

  if (ruleset.required?.number) {
    rules.push(PREDEFINED_RULES.number());
  }

  if (ruleset.required?.special) {
    rules.push(PREDEFINED_RULES.special());
  }

  if (ruleset.allowed?.characters) {
    rules.push(PREDEFINED_RULES.allowedCharacters(ruleset.allowed.characters));
  }

  if (ruleset.customRules) {
    rules.push(...ruleset.customRules);
  }

  return rules;
}

// =============================================================================
// VALIDATOR
// A pure function that runs a list of rules against a password.
// It has no knowledge of predefined rules, rulesets, or Zod schemas.
// It only knows: given rules and a password, return results.
// =============================================================================

/**
 * Represents the result of a single rule check.
 */
export type RuleResult = {
  /** Human-readable label describing the rule. */
  label: string;
  /** Whether the password currently satisfies this rule. */
  passed: boolean;
};

/**
 * The full result of validating a password against a set of rules.
 */
export type ValidationResult = {
  /** Individual rule results to display in the checklist. */
  rules: RuleResult[];
  /** True only when every rule has passed. */
  valid: boolean;
};

/**
 * Pure function that validates a password against a list of rules.
 *
 * This function is intentionally rule-agnostic — it does not know
 * what rules exist or where they came from. It simply runs each
 * rule's validate function and collects the results.
 *
 * Pair with `buildRules` to convert a `PasswordRuleset` into rules first:
 *
 * @param password - The current password string to validate.
 * @param rules - The list of rules to run, typically from `buildRules`.
 * @returns A `ValidationResult` with each rule's result and an overall valid flag.
 *
 * @example
 * ```ts
 * const rules = buildRules({
 *   length: { min: 8 },
 *   required: { uppercase: true, number: true },
 * })
 *
 * const result = validatePassword("Hello1!", rules)
 * // result.rules[0] → { label: "At least 8 characters", passed: false }
 * // result.rules[1] → { label: "At least one uppercase letter", passed: true }
 * // result.rules[2] → { label: "At least one number", passed: true }
 * // result.valid → false
 * ```
 */
export function validatePassword(
  password: string,
  rules: Rule[],
): ValidationResult {
  const results = rules.map((rule) => ({
    label: rule.label,
    passed: rule.validate(password),
  }));

  return {
    rules: results,
    valid: results.every((r) => r.passed),
  };
}
