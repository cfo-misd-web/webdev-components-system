import { createFileRoute } from '@tanstack/react-router'
import { PasswordInput } from '@registry/ui/password-input'
import type { PasswordRuleset } from '@registry/lib/password-input/validation'
import { useState } from 'react'

const ruleset: PasswordRuleset = {
  length: { min: 8, max: 32 },
  required: {
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
  },
  customRules: [
    {
      label: 'Cannot contain spaces',
      validate: (p) => !p.includes(' '),
    },
  ],
}

function TestPage() {
  const [basic, setBasic] = useState('')
  const [withRuleset, setWithRuleset] = useState('')
  const [withError, setWithError] = useState('')
  const [withCustomStyle, setWithCustomStyle] = useState('')

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10 p-8">
      <h1 className="text-kumo-strong text-xl font-semibold">
        PasswordInput Test
      </h1>

      {/* Basic — no label, no ruleset */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Basic (no label, no ruleset)
        </h2>
        <PasswordInput
          placeholder="Enter password"
          value={basic}
          onChange={setBasic}
        />
        <p className="text-kumo-subtle text-xs">Value: {basic || '(empty)'}</p>
      </section>

      {/* With ruleset */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          With label, description, and ruleset
        </h2>
        <PasswordInput
          label="Password"
          description="Must meet all requirements below"
          value={withRuleset}
          onChange={setWithRuleset}
          ruleset={ruleset}
        />
        <p className="text-kumo-subtle text-xs">
          Value: {withRuleset || '(empty)'}
        </p>
      </section>

      {/* With error */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          With error state
        </h2>
        <PasswordInput
          label="Password"
          value={withError}
          onChange={setWithError}
          error="Password is incorrect. Please try again."
          ruleset={ruleset}
        />
        <p className="text-kumo-subtle text-xs">
          Value: {withError || '(empty)'}
        </p>
      </section>

      {/* With custom classNames */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          With custom classNames
        </h2>
        <PasswordInput
          label="Password"
          description="Custom styles applied to root and checklist items"
          value={withCustomStyle}
          onChange={setWithCustomStyle}
          ruleset={ruleset}
          classNames={{
            root: 'bg-kumo-tint rounded-lg p-4',
            checklistItemPassed: 'text-kumo-info',
            checklistItemFailed: 'text-kumo-danger',
          }}
        />
        <p className="text-kumo-subtle text-xs">
          Value: {withCustomStyle || '(empty)'}
        </p>
      </section>

      {/* Disabled */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Disabled state
        </h2>
        <PasswordInput
          label="Password"
          value="disabled-value"
          onChange={() => {}}
          disabled
        />
      </section>
    </div>
  )
}

export const Route = createFileRoute('/test-password')({
  component: TestPage,
})
