"use client";

import * as React from "react";
import { Collapsible } from "@cloudflare/kumo";
import {
  resolveNextSingleValue,
  resolveNextMultipleValue,
  isItemOpen,
  normalizeToArray,
  denormalizeValue,
} from "@/lib/accordion/validation";
import { cn } from "@/utils/cn";

// =============================================================================
// TYPES
// =============================================================================

/**
 * Style overrides for each distinct visual part of the Accordion component.
 * All keys are optional — only override what you need.
 * Values are Tailwind class strings merged on top of defaults via cn().
 *
 * Always use Kumo semantic color tokens (e.g. `text-kumo-subtle`) instead
 * of raw Tailwind colors to ensure light/dark mode compatibility.
 *
 * Note: `chevron` only applies when a custom `chevron` prop is passed to
 * `Accordion.Trigger` — it has no effect when using the default Kumo chevron.
 *
 * @example
 * ```tsx
 * classNames={{
 *   root: "w-full max-w-lg",
 *   item: "rounded-lg border-kumo-hairline",
 *   trigger: "w-full justify-between text-kumo-strong",
 *   content: "text-kumo-subtle",
 *   chevron: "text-kumo-subtle",
 * }}
 * ```
 */
export interface AccordionClassNames {
  /** The outermost wrapper div containing all items. */
  root?: string;
  /** Each individual accordion item wrapper. Applied to every item. */
  item?: string;
  /**
   * Applied to each item when it is disabled.
   * Merged on top of `item` styles for disabled items.
   */
  itemDisabled?: string;
  /** The trigger button for each item. Applied to every trigger. */
  trigger?: string;
  /** The content panel for each item. Applied to every panel. */
  content?: string;
  /**
   * The chevron icon wrapper span.
   * Only applies when a custom `chevron` is passed to `Accordion.Trigger`.
   * Has no effect when using the default Kumo chevron.
   */
  chevron?: string;
}

/**
 * Props for the Accordion root component.
 */
export interface AccordionProps {
  /**
   * Controls how many items can be open at once.
   * - `"single"` — only one item open at a time (default)
   * - `"multiple"` — any number of items can be open simultaneously
   * @default "single"
   */
  type?: "single" | "multiple";

  /**
   * Controlled value — the currently open item(s).
   * - String for `type="single"`
   * - String array for `type="multiple"`
   *
   * Pair with `onValueChange` for controlled usage.
   * Omit for uncontrolled usage — use `defaultValue` instead.
   *
   * @optional
   */
  value?: string | string[];

  /**
   * The item(s) open by default in uncontrolled usage.
   * - String for `type="single"`
   * - String array for `type="multiple"`
   *
   * Ignored when `value` is provided.
   *
   * @optional
   * @example
   * ```tsx
   * <Accordion defaultValue="item1" />
   * <Accordion type="multiple" defaultValue={["item1", "item2"]} />
   * ```
   */
  defaultValue?: string | string[];

  /**
   * Callback fired when the open value changes.
   * - Receives `string | undefined` for `type="single"`
   * - Receives `string[]` for `type="multiple"`
   *
   * @optional
   */
  onValueChange?: (value: string | string[] | undefined) => void;

  /**
   * When `true` (default), clicking the open item in `type="single"` mode
   * closes it. When `false`, one item always stays open.
   *
   * Only applies to `type="single"`.
   *
   * @default true
   * @optional
   */
  collapsible?: boolean;

  /**
   * Controls whether opening and closing items is animated smoothly.
   *
   * - `true` — smooth slide animation using CSS grid-template-rows (default)
   * - `false` — instant open/close with no animation
   *
   * @default true
   * @optional
   *
   * @example
   * ```tsx
   * <Accordion animate={false}>...</Accordion>
   * ```
   */
  animate?: boolean;

  /** The accordion items. Use `Accordion.Item` as direct children. */
  children: React.ReactNode;

  /**
   * Tailwind class overrides for each visual part of the component.
   * Always use Kumo semantic color tokens instead of raw Tailwind colors.
   *
   * @optional
   * @example
   * ```tsx
   * classNames={{
   *   root: "w-full max-w-lg",
   *   trigger: "w-full justify-between text-kumo-strong",
   * }}
   * ```
   */
  classNames?: AccordionClassNames;
}

/**
 * Props for each accordion item.
 */
export interface AccordionItemProps {
  /**
   * A unique identifier for this item.
   * Used to track open state and must be unique within the accordion.
   * @example "faq-1" | "section-billing"
   */
  value: string;

  /** The trigger and content for this item. */
  children: React.ReactNode;

  /**
   * When `true`, the item cannot be opened or closed by the user.
   * @optional
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional Tailwind classes applied to this specific item's wrapper.
   * Merged on top of the accordion-level `classNames.item`.
   * @optional
   */
  className?: string;
}

/**
 * Props for the accordion item trigger.
 */
export interface AccordionTriggerProps {
  /** The trigger label. Can be any React node. */
  children: React.ReactNode;

  /**
   * Controls the chevron icon shown on the right side of the trigger.
   *
   * - `undefined` — uses Kumo's built-in chevron via `Collapsible.DefaultTrigger` (default)
   * - `false` — no chevron rendered
   * - `ReactNode` — a custom icon; rotates 180° when open by default (see `autoRotate`)
   *
   * When a custom chevron is provided, the trigger switches from
   * `Collapsible.DefaultTrigger` to `Collapsible.Trigger` internally.
   * Use `classNames.chevron` on the Accordion to style the chevron wrapper.
   *
   * @optional
   *
   * @example No chevron
   * ```tsx
   * <Accordion.Trigger chevron={false}>Title</Accordion.Trigger>
   * ```
   *
   * @example Custom chevron with auto-rotation
   * ```tsx
   * <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
   *   Title
   * </Accordion.Trigger>
   * ```
   *
   * @example Custom chevron without auto-rotation
   * ```tsx
   * <Accordion.Trigger
   *   chevron={<PlusIcon size={16} />}
   *   autoRotate={false}
   * >
   *   Title
   * </Accordion.Trigger>
   * ```
   */
  chevron?: React.ReactNode | false;

  /**
   * When `true` (default), a custom chevron wrapper automatically rotates
   * 180° when the item is open and back when closed.
   *
   * Set to `false` if you want to control the rotation yourself — useful
   * when using an icon that communicates open/close state differently
   * (e.g. a Plus/Minus icon pair).
   *
   * Only applies when `chevron` is a `ReactNode`.
   * Has no effect when `chevron` is `undefined` or `false`.
   *
   * @default true
   * @optional
   *
   * @example Disable auto-rotation for a plus/minus icon
   * ```tsx
   * <Accordion.Trigger
   *   chevron={isOpen ? <MinusIcon size={16} /> : <PlusIcon size={16} />}
   *   autoRotate={false}
   * >
   *   Title
   * </Accordion.Trigger>
   * ```
   */
  autoRotate?: boolean;

  /**
   * Additional Tailwind classes applied to this specific trigger.
   * Merged on top of the accordion-level `classNames.trigger`.
   * @optional
   */
  className?: string;
}

/**
 * Props for the accordion item content panel.
 */
export interface AccordionContentProps {
  /** The content shown when the item is open. Can be any React node. */
  children: React.ReactNode;

  /**
   * Additional Tailwind classes applied to this specific content panel inner wrapper.
   * Merged on top of the accordion-level `classNames.content`.
   * @optional
   */
  className?: string;
}

// =============================================================================
// CONTEXTS
// Internal React contexts for communicating between compound components.
// Not exported — consumers use the compound component API, not context directly.
// =============================================================================

interface AccordionContextValue {
  type: "single" | "multiple";
  openValues: string[];
  onItemToggle: (value: string) => void;
  collapsible: boolean;
  animate: boolean;
  classNames?: AccordionClassNames;
}

interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  disabled: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null,
);
const AccordionItemContext =
  React.createContext<AccordionItemContextValue | null>(null);

// =============================================================================
// CONTEXT HOOKS
// Pure selectors that read from context with clear error messages.
// =============================================================================

/**
 * Reads the accordion-level context.
 * Throws a clear error if used outside of an Accordion component.
 */
function useAccordionContext(): AccordionContextValue {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion sub-components must be used inside <Accordion>.",
    );
  }
  return context;
}

/**
 * Reads the item-level context.
 * Throws a clear error if used outside of an Accordion.Item component.
 */
function useAccordionItemContext(): AccordionItemContextValue {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error(
      "Accordion.Trigger and Accordion.Content must be used inside <Accordion.Item>.",
    );
  }
  return context;
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
  root: "flex w-full flex-col",
  item: "border-b border-kumo-hairline last:border-0",
  itemDisabled: "pointer-events-none opacity-50",
  trigger: "w-full justify-between flex items-center",
  content: "",
  chevron: "shrink-0",
} as const satisfies Record<keyof AccordionClassNames, string>;

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
 * @param part - The component part key from AccordionClassNames.
 * @param overrides - The consumer's classNames prop (optional).
 * @returns The merged Tailwind class string.
 */
function resolvePart(
  part: keyof AccordionClassNames,
  overrides?: AccordionClassNames,
): string {
  return cn(DEFAULT_STYLES[part], overrides?.[part]);
}

// =============================================================================
// SUB-COMPONENTS
// Internal implementations of the compound component parts.
// Each sub-component has a single rendering responsibility.
// All state and logic flow through context — no prop drilling.
// =============================================================================

/**
 * An individual accordion item. Wrap trigger and content inside this.
 * Must be a direct child of `<Accordion>`.
 *
 * @example
 * ```tsx
 * <Accordion.Item value="item1">
 *   <Accordion.Trigger>Section title</Accordion.Trigger>
 *   <Accordion.Content>Section content</Accordion.Content>
 * </Accordion.Item>
 * ```
 */
function AccordionItem({
  value,
  children,
  disabled = false,
  className,
}: AccordionItemProps) {
  const { openValues, onItemToggle, classNames } = useAccordionContext();
  const open = isItemOpen(value, openValues);

  const itemContext: AccordionItemContextValue = {
    value,
    isOpen: open,
    disabled,
  };

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <Collapsible.Root
        open={open}
        onOpenChange={() => {
          if (!disabled) onItemToggle(value);
        }}
        className={cn(
          resolvePart("item", classNames),
          disabled ? resolvePart("itemDisabled", classNames) : undefined,
          className,
        )}
      >
        {children}
      </Collapsible.Root>
    </AccordionItemContext.Provider>
  );
}

/**
 * The clickable trigger that opens and closes an accordion item.
 * Must be used inside `<Accordion.Item>`.
 *
 * **Accessibility** — provided by Kumo's Collapsible (Base UI):
 * - `aria-expanded` reflects the open state automatically
 * - Keyboard navigation: Space and Enter toggle the item
 * - Focus management is handled by Base UI
 *
 * **Chevron behaviour:**
 * - Default (`chevron` omitted) — Kumo's built-in chevron via `Collapsible.DefaultTrigger`
 * - `chevron={false}` — no chevron
 * - `chevron={<Icon />}` — custom icon; rotates 180° when open by default
 * - `chevron={<Icon />} autoRotate={false}` — custom icon, no auto-rotation
 *
 * @example Default Kumo chevron
 * ```tsx
 * <Accordion.Trigger>Section title</Accordion.Trigger>
 * ```
 *
 * @example No chevron
 * ```tsx
 * <Accordion.Trigger chevron={false}>Section title</Accordion.Trigger>
 * ```
 *
 * @example Custom chevron with auto-rotation (default)
 * ```tsx
 * <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
 *   Section title
 * </Accordion.Trigger>
 * ```
 *
 * @example Custom chevron without auto-rotation
 * ```tsx
 * <Accordion.Trigger
 *   chevron={<PlusIcon size={16} />}
 *   autoRotate={false}
 * >
 *   Section title
 * </Accordion.Trigger>
 * ```
 */
function AccordionTrigger({
  children,
  chevron,
  autoRotate = true,
  className,
}: AccordionTriggerProps) {
  const { classNames } = useAccordionContext();
  const { isOpen, disabled } = useAccordionItemContext();

  const triggerClassName = cn(resolvePart("trigger", classNames), className);

  if (chevron === undefined) {
    return (
      <Collapsible.DefaultTrigger
        className={triggerClassName}
        aria-disabled={disabled || undefined}
      >
        {children}
      </Collapsible.DefaultTrigger>
    );
  }

  return (
    <Collapsible.Trigger
      className={triggerClassName}
      aria-disabled={disabled || undefined}
    >
      {children}
      {chevron !== false && (
        <span
          className={cn(
            "inline-flex shrink-0",
            resolvePart("chevron", classNames),
          )}
          style={
            autoRotate
              ? {
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 200ms ease-in-out",
                }
              : undefined
          }
          aria-hidden="true"
        >
          {chevron}
        </span>
      )}
    </Collapsible.Trigger>
  );
}

/**
 * The collapsible content panel for an accordion item.
 * Must be used inside `<Accordion.Item>`.
 *
 * Always remains mounted in the DOM — this is what ensures smooth animation
 * in both the opening and closing directions. CSS grid-template-rows handles
 * the transition. When closed, `aria-hidden` prevents screen readers from
 * reading the hidden content.
 *
 * Animation is controlled by the `animate` prop on the parent `<Accordion>`.
 *
 * @example
 * ```tsx
 * <Accordion.Content>Plain text content.</Accordion.Content>
 *
 * <Accordion.Content>
 *   <div className="flex flex-col gap-2">
 *     <p>Rich content</p>
 *     <Button>Action</Button>
 *   </div>
 * </Accordion.Content>
 * ```
 */
function AccordionContent({ children, className }: AccordionContentProps) {
  const { animate, classNames } = useAccordionContext();
  const { isOpen } = useAccordionItemContext();

  return (
    <div
      aria-hidden={!isOpen}
      className={cn(
        "grid overflow-hidden",
        animate && "transition-[grid-template-rows] duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div
        className={cn(
          "min-h-0 overflow-hidden",
          resolvePart("content", classNames),
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// The main Accordion component.
// Manages open state (controlled or uncontrolled) and provides context.
// Contains no layout or rendering logic — delegates to sub-components.
// =============================================================================

/**
 * A vertically stacked set of interactive headings that reveal or hide
 * associated content sections.
 *
 * Built as a compound component — use `Accordion.Item`, `Accordion.Trigger`,
 * and `Accordion.Content` to compose the accordion structure.
 *
 * **Accessibility** — provided by Kumo's Collapsible (Base UI):
 * - `aria-expanded` on each trigger reflects open state automatically
 * - Keyboard navigation: Space and Enter toggle items
 * - Focus management handled by Base UI
 * - Disabled items use `pointer-events-none` and `opacity-50`
 *
 * **Animation** — uses CSS `grid-template-rows` transition:
 * - `true` (default) — smooth slide animation
 * - `false` — instant open/close
 *
 * **Chevron** — controlled per trigger via `chevron` and `autoRotate` props:
 * - `undefined` (default) — Kumo's built-in chevron
 * - `false` — no chevron
 * - `ReactNode` — custom icon; auto-rotates 180° by default
 * - `ReactNode` + `autoRotate={false}` — custom icon, no auto-rotation
 *
 * @remarks
 * **Controlled vs uncontrolled:** Omit `value` for uncontrolled usage
 * (use `defaultValue` to set the initial state). Provide `value` and
 * `onValueChange` for controlled usage.
 *
 * @example Uncontrolled — single mode
 * ```tsx
 * <Accordion defaultValue="item1">
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger>What is this?</Accordion.Trigger>
 *     <Accordion.Content>An accordion component.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Instant open/close (no animation)
 * ```tsx
 * <Accordion animate={false}>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger>Title</Accordion.Trigger>
 *     <Accordion.Content>Appears instantly.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Custom chevron with auto-rotation
 * ```tsx
 * <Accordion>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
 *       Title
 *     </Accordion.Trigger>
 *     <Accordion.Content>Content</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Custom chevron without auto-rotation
 * ```tsx
 * <Accordion>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger
 *       chevron={<PlusIcon size={16} />}
 *       autoRotate={false}
 *     >
 *       Title
 *     </Accordion.Trigger>
 *     <Accordion.Content>Content</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example No chevron
 * ```tsx
 * <Accordion>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger chevron={false}>Title</Accordion.Trigger>
 *     <Accordion.Content>Content</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Multiple mode
 * ```tsx
 * <Accordion type="multiple" defaultValue={["item1"]}>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger>First</Accordion.Trigger>
 *     <Accordion.Content>Always open by default.</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Controlled
 * ```tsx
 * const [open, setOpen] = useState<string | undefined>("item1")
 *
 * <Accordion value={open} onValueChange={(v) => setOpen(v as string)}>
 *   <Accordion.Item value="item1">
 *     <Accordion.Trigger>Section</Accordion.Trigger>
 *     <Accordion.Content>Content</Accordion.Content>
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * @example Non-collapsible
 * ```tsx
 * <Accordion type="single" collapsible={false} defaultValue="item1">
 *   ...
 * </Accordion>
 * ```
 *
 * @example With style overrides
 * ```tsx
 * <Accordion
 *   classNames={{
 *     root: "w-full max-w-lg",
 *     item: "rounded-lg border border-kumo-hairline mb-2 last:mb-0",
 *     trigger: "w-full justify-between text-kumo-strong px-4",
 *     content: "px-4 text-kumo-subtle",
 *     chevron: "text-kumo-subtle",
 *   }}
 * >
 *   ...
 * </Accordion>
 * ```
 */
export function Accordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  animate = true,
  children,
  classNames,
}: AccordionProps) {
  const normalizedDefault = normalizeToArray(defaultValue);

  // Determined once at mount — never switches mid-lifecycle.
  // Switching between controlled and uncontrolled after mount is not supported,
  // just as React's own controlled inputs do not support it.
  const isControlledRef = React.useRef(value !== undefined);
  const isControlled = isControlledRef.current;

  const normalizedValue =
    value !== undefined ? normalizeToArray(value) : undefined;

  const [internalValue, setInternalValue] =
    React.useState<string[]>(normalizedDefault);

  const openValues = isControlled ? (normalizedValue ?? []) : internalValue;

  function handleItemToggle(itemValue: string) {
    const next =
      type === "single"
        ? normalizeToArray(
            resolveNextSingleValue(openValues[0], itemValue, collapsible),
          )
        : resolveNextMultipleValue(openValues, itemValue);

    if (!isControlled) setInternalValue(next);
    onValueChange?.(denormalizeValue(next, type));
  }

  const contextValue: AccordionContextValue = {
    type,
    openValues,
    onItemToggle: handleItemToggle,
    collapsible,
    animate,
    classNames,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={resolvePart("root", classNames)}>{children}</div>
    </AccordionContext.Provider>
  );
}

Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;
