import { createFileRoute } from '@tanstack/react-router'
import { Accordion } from '@registry/ui/accordion'
import { useState } from 'react'
import {
  ShieldCheckIcon,
  CreditCardIcon,
  UserCircleIcon,
  BellIcon,
  CodeIcon,
  CaretDownIcon,
  PlusIcon,
  MinusIcon,
} from '@phosphor-icons/react'

function AccordionTestPage() {
  const [controlled, setControlled] = useState<string | undefined>('item1')
  const [multiControlled, setMultiControlled] = useState<string[]>(['item1'])
  const [plusMinus, setPlusMinus] = useState<string | undefined>(undefined)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10 p-8">
      <h1 className="text-kumo-strong text-xl font-semibold">Accordion Test</h1>

      {/* ================================================================
          BASIC MODES
      ================================================================ */}

      {/* Single — uncontrolled */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Single — uncontrolled (default open: item1)
        </h2>
        <Accordion defaultValue="item1">
          <Accordion.Item value="item1">
            <Accordion.Trigger>What is this registry?</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                A component registry built on shadcn's distribution system.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>How do I install components?</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Use the shadcn CLI to install components from the registry.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger>What stack does it support?</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Drizzle, BetterAuth, Hono, oRPC, and TanStack Start.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Single — non-collapsible */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Single — non-collapsible (one always stays open)
        </h2>
        <Accordion defaultValue="item1" collapsible={false}>
          <Accordion.Item value="item1">
            <Accordion.Trigger>Always one open</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Clicking this when open does nothing.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Click me to switch</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Now this one stays open instead.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Multiple — uncontrolled */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Multiple — uncontrolled
        </h2>
        <Accordion type="multiple" defaultValue={['item1', 'item2']}>
          <Accordion.Item value="item1">
            <Accordion.Trigger>First section</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">Open by default.</p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Second section</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Also open by default.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger>Third section</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">Closed by default.</p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* ================================================================
          CONTROLLED
      ================================================================ */}

      {/* Controlled — single */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Controlled — single
        </h2>
        <p className="text-kumo-subtle text-xs">
          Currently open: {controlled ?? '(none)'}
        </p>
        <Accordion
          value={controlled}
          onValueChange={(v) => setControlled(v as string | undefined)}
        >
          <Accordion.Item value="item1">
            <Accordion.Trigger>Item 1</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Controlled content 1.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Item 2</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Controlled content 2.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Controlled — multiple */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Controlled — multiple
        </h2>
        <p className="text-kumo-subtle text-xs">
          Currently open: {multiControlled.join(', ') || '(none)'}
        </p>
        <Accordion
          type="multiple"
          value={multiControlled}
          onValueChange={(v) => setMultiControlled(v as string[])}
        >
          <Accordion.Item value="item1">
            <Accordion.Trigger>Item 1</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Controlled multi content 1.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Item 2</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Controlled multi content 2.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger>Item 3</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Controlled multi content 3.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* ================================================================
          DISABLED
      ================================================================ */}

      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">Disabled item</h2>
        <Accordion defaultValue="item1">
          <Accordion.Item value="item1">
            <Accordion.Trigger>Available item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                This item works normally.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2" disabled>
            <Accordion.Trigger>Disabled item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                This content cannot be reached.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger>Another available item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                This item works normally too.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* ================================================================
          ANIMATION
      ================================================================ */}

      {/* Smooth animation — default */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Smooth animation (animate=true — default)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Open item1 then click item2 — both transitions should be smooth
          simultaneously.
        </p>
        <Accordion defaultValue="item1">
          <Accordion.Item value="item1">
            <Accordion.Trigger>First item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Click another item while this is open — closing this and opening
                the other should both animate smoothly at the same time.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Second item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Now click back to the first item. Still smooth in both
                directions.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger>Third item</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Three items ensures the simultaneous open/close case is tested
                thoroughly.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Instant — no animation */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Instant open/close (animate=false)
        </h2>
        <Accordion animate={false}>
          <Accordion.Item value="item1">
            <Accordion.Trigger>Opens instantly</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                No animation — appears and disappears immediately.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Also instant</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Useful when animation feels too slow for your use case.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* ================================================================
          CHEVRON TESTS
      ================================================================ */}

      {/* Default Kumo chevron */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Default Kumo chevron (chevron omitted)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Uses Kumo's built-in chevron via Collapsible.DefaultTrigger. Rotation
          is managed by Kumo internally.
        </p>
        <Accordion>
          <Accordion.Item value="item1">
            <Accordion.Trigger>Item with default chevron</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Kumo's chevron rotates automatically.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger>Another with default chevron</Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Same default behaviour on every item.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Custom chevron — autoRotate=true (default) */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom chevron — autoRotate=true (default)
        </h2>
        <p className="text-kumo-subtle text-xs">
          CaretDownIcon rotates 180° when open, back to 0° when closed.
          Switching between items should animate the chevrons simultaneously
          with the content.
        </p>
        <Accordion
          classNames={{
            trigger: 'w-full justify-between px-3 py-2',
            chevron: 'text-kumo-subtle',
          }}
        >
          <Accordion.Item value="item1">
            <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
              Custom chevron — auto-rotates
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-3">
                The caret rotates 180° when this item is open.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
              Another item — auto-rotates
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-3">
                Switch between items to verify both chevrons animate correctly.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item3">
            <Accordion.Trigger chevron={<CaretDownIcon size={16} />}>
              Third item — auto-rotates
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-3">
                Three items to stress test simultaneous open/close chevron
                rotation.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Custom chevron — autoRotate=false */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom chevron — autoRotate=false
        </h2>
        <p className="text-kumo-subtle text-xs">
          CaretDownIcon does not rotate. Useful when the icon itself
          communicates state — e.g. a Plus/Minus pair.
        </p>
        <Accordion
          classNames={{
            trigger: 'w-full justify-between px-3 py-2',
            chevron: 'text-kumo-subtle',
          }}
        >
          <Accordion.Item value="item1">
            <Accordion.Trigger
              chevron={<CaretDownIcon size={16} />}
              autoRotate={false}
            >
              No rotation on this caret
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-3">
                The caret stays pointing down whether open or closed.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger
              chevron={<CaretDownIcon size={16} />}
              autoRotate={false}
            >
              Also no rotation
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-3">
                Consumer is responsible for communicating open state another
                way.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* Custom chevron — Plus/Minus pattern with autoRotate=false */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom chevron — Plus/Minus pattern (autoRotate=false)
        </h2>
        <p className="text-kumo-subtle text-xs">
          The icon itself changes based on open state — no rotation needed. Uses
          controlled state to read isOpen outside the trigger.
        </p>
        <Accordion
          value={plusMinus}
          onValueChange={(v) => setPlusMinus(v as string | undefined)}
          classNames={{
            trigger: 'w-full justify-between px-3 py-2',
          }}
        >
          {['item1', 'item2', 'item3'].map((item, i) => (
            <Accordion.Item key={item} value={item}>
              <Accordion.Trigger
                chevron={
                  plusMinus === item ? (
                    <MinusIcon size={16} className="text-kumo-subtle" />
                  ) : (
                    <PlusIcon size={16} className="text-kumo-subtle" />
                  )
                }
                autoRotate={false}
              >
                Section {i + 1}
              </Accordion.Trigger>
              <Accordion.Content>
                <p className="text-kumo-subtle text-sm p-3">
                  Shows a minus when open, plus when closed. No rotation
                  involved.
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </section>

      {/* No chevron */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          No chevron (chevron=false)
        </h2>
        <Accordion>
          <Accordion.Item value="item1">
            <Accordion.Trigger chevron={false}>
              No chevron at all
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Useful when the trigger design communicates open state another
                way.
              </p>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="item2">
            <Accordion.Trigger chevron={false}>
              Also no chevron
            </Accordion.Trigger>
            <Accordion.Content>
              <p className="text-kumo-subtle text-sm p-2">
                Clean look without any indicator icon.
              </p>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* ================================================================
          WELL-DESIGNED EXAMPLE — Settings Panel
      ================================================================ */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Well-designed — settings panel
        </h2>
        <Accordion
          type="single"
          defaultValue="security"
          collapsible={false}
          classNames={{
            root: 'rounded-xl border border-kumo-hairline overflow-hidden bg-kumo-base',
            item: 'border-b border-kumo-hairline last:border-0',
            trigger: 'px-5 py-4 hover:bg-kumo-tint transition-colors',
          }}
        >
          <Accordion.Item value="security">
            <Accordion.Trigger>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kumo-success-tint">
                  <ShieldCheckIcon
                    size={16}
                    className="fill-kumo-success"
                    weight="fill"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-kumo-strong text-sm font-medium">
                    Security
                  </span>
                  <span className="text-kumo-subtle text-xs">
                    Password, two-factor authentication
                  </span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Two-factor authentication
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      Add an extra layer of security to your account
                    </span>
                  </div>
                  <span className="rounded-full bg-kumo-success-tint px-2 py-0.5 text-xs text-kumo-success">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Password
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      Last changed 3 months ago
                    </span>
                  </div>
                  <button className="text-kumo-link text-xs hover:underline">
                    Change
                  </button>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="billing">
            <Accordion.Trigger>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kumo-brand-tint">
                  <CreditCardIcon
                    size={16}
                    className="fill-kumo-brand"
                    weight="fill"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-kumo-strong text-sm font-medium">
                    Billing
                  </span>
                  <span className="text-kumo-subtle text-xs">
                    Plan, payment methods, invoices
                  </span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Current plan
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      Pro — $29/month
                    </span>
                  </div>
                  <button className="text-kumo-link text-xs hover:underline">
                    Upgrade
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Payment method
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      Visa ending in 4242
                    </span>
                  </div>
                  <button className="text-kumo-link text-xs hover:underline">
                    Update
                  </button>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="profile">
            <Accordion.Trigger>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kumo-info-tint">
                  <UserCircleIcon
                    size={16}
                    className="fill-kumo-info"
                    weight="fill"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-kumo-strong text-sm font-medium">
                    Profile
                  </span>
                  <span className="text-kumo-subtle text-xs">
                    Name, email, avatar
                  </span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-3 rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-kumo-brand text-sm font-medium text-white">
                    GC
                  </div>
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Gino Carlos
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      gino@example.com
                    </span>
                  </div>
                  <button className="ml-auto text-kumo-link text-xs hover:underline">
                    Edit
                  </button>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="notifications">
            <Accordion.Trigger>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kumo-warning-tint">
                  <BellIcon
                    size={16}
                    className="fill-kumo-warning"
                    weight="fill"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-kumo-strong text-sm font-medium">
                    Notifications
                  </span>
                  <span className="text-kumo-subtle text-xs">
                    Email, push, and in-app alerts
                  </span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-2 p-5">
                {[
                  {
                    label: 'Security alerts',
                    sub: 'Login attempts and password changes',
                    enabled: true,
                  },
                  {
                    label: 'Billing updates',
                    sub: 'Invoices and payment confirmations',
                    enabled: true,
                  },
                  {
                    label: 'Product updates',
                    sub: 'New features and improvements',
                    enabled: false,
                  },
                  {
                    label: 'Marketing emails',
                    sub: 'Tips, offers, and announcements',
                    enabled: false,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-kumo-default text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="text-kumo-subtle text-xs">
                        {item.sub}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        item.enabled
                          ? 'bg-kumo-success-tint text-kumo-success'
                          : 'bg-kumo-tint text-kumo-subtle'
                      }`}
                    >
                      {item.enabled ? 'On' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>

          <Accordion.Item value="developer">
            <Accordion.Trigger>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kumo-elevated">
                  <CodeIcon
                    size={16}
                    className="text-kumo-default"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-kumo-strong text-sm font-medium">
                    Developer
                  </span>
                  <span className="text-kumo-subtle text-xs">
                    API keys, webhooks, integrations
                  </span>
                </div>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      API key
                    </span>
                    <span className="font-mono text-xs text-kumo-subtle">
                      sk_live_••••••••••••4242
                    </span>
                  </div>
                  <button className="text-kumo-link text-xs hover:underline">
                    Reveal
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-kumo-tint px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-kumo-default text-sm font-medium">
                      Webhooks
                    </span>
                    <span className="text-kumo-subtle text-xs">
                      2 endpoints configured
                    </span>
                  </div>
                  <button className="text-kumo-link text-xs hover:underline">
                    Manage
                  </button>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
      </section>
    </div>
  )
}

export const Route = createFileRoute('/test-accordion')({
  component: AccordionTestPage,
})
