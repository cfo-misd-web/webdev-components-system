import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { SearchBar } from '@registry/ui/search-bar'
import type { SearchBarRouterAdapter } from '@registry/ui/search-bar'
import { z } from 'zod'

const searchSchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  keyword: z.string().optional(),
  styled: z.string().optional(),
  users: z.string().optional(),
})

const MOCK_USERS = [
  { id: 1, name: 'Alice Johnson', role: 'Admin' },
  { id: 2, name: 'Bob Smith', role: 'Editor' },
  { id: 3, name: 'Carol White', role: 'Viewer' },
  { id: 4, name: 'David Brown', role: 'Editor' },
  { id: 5, name: 'Eve Davis', role: 'Admin' },
  { id: 6, name: 'Frank Miller', role: 'Viewer' },
]

function SearchTestPage() {
  const router = useRouter()
  const search = useSearch({ from: '/test-search' })
  const searchParams = search as Record<string, string | undefined>

  const adapter: SearchBarRouterAdapter = {
    getParam: (key) => searchParams[key] ?? '',
    setParam: (key, value, resetScroll) =>
      router
        .navigate({
          from: '/test-search',
          resetScroll:
            resetScroll === 'smooth' ? false : (resetScroll ?? false),
          // @ts-expect-error — TanStack Router strict global type intersection,
          // as any is intentional here. See SearchBar component docs for details.
          search: (prev) => ({ ...prev, [key]: value }),
        })
        .then(() => {
          if (resetScroll === 'smooth') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }),
    clearParam: (key, resetScroll) =>
      router
        .navigate({
          from: '/test-search',
          resetScroll:
            resetScroll === 'smooth' ? false : (resetScroll ?? false),
          // @ts-expect-error — TanStack Router strict global type intersection,
          // as any is intentional here. See SearchBar component docs for details.
          search: (prev) => {
            const next = { ...prev } as Record<string, string | undefined>
            delete next[key]

            return next as any
          },
        })
        .then(() => {
          if (resetScroll === 'smooth') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }),
  }

  const userQuery = searchParams['users']?.toLowerCase() ?? ''
  const filteredUsers = MOCK_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(userQuery) ||
      user.role.toLowerCase().includes(userQuery),
  )

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10 p-8">
      <h1 className="text-kumo-strong text-xl font-semibold">SearchBar Test</h1>

      {/* Basic */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Basic (no clear button)
        </h2>
        <SearchBar adapter={adapter} />
        <p className="text-kumo-subtle text-xs">
          URL param: {search.search || '(empty)'}
        </p>
      </section>

      {/* Clearable */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">Clearable</h2>
        <SearchBar adapter={adapter} paramName="q" clearable />
        <p className="text-kumo-subtle text-xs">
          URL param: {search.q || '(empty)'}
        </p>
      </section>

      {/* Custom param name + server-side callback */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom param + onSearch callback
        </h2>
        <SearchBar
          adapter={adapter}
          paramName="keyword"
          clearable
          onSearch={(value) => console.log('onSearch fired:', value)}
          placeholder="Search users..."
        />
        <p className="text-kumo-subtle text-xs">
          URL param: {search.keyword || '(empty)'}
        </p>
      </section>

      {/* Custom styles */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom classNames
        </h2>
        <SearchBar
          adapter={adapter}
          paramName="styled"
          clearable
          classNames={{
            root: 'max-w-xs',
            clearButton: 'text-kumo-danger',
          }}
        />
        <p className="text-kumo-subtle text-xs">
          URL param: {search.styled || '(empty)'}
        </p>
      </section>

      {/* Disabled */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">Disabled</h2>
        <SearchBar adapter={adapter} disabled />
      </section>

      {/* Scroll behavior — no reset (default) */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Scroll behavior — none (default)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Page stays in place when searching.
        </p>
        <SearchBar
          adapter={adapter}
          paramName="search"
          clearable
          resetScroll={false}
        />
      </section>

      {/* Scroll behavior — smooth */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Scroll behavior — smooth
        </h2>
        <p className="text-kumo-subtle text-xs">
          Scrolls to top smoothly after each search update. Type something to
          test.
        </p>
        <SearchBar
          adapter={adapter}
          paramName="q"
          clearable
          resetScroll="smooth"
        />
      </section>

      {/* Scroll behavior — instant */}
      <section className="flex flex-col gap-2">
        <h2 className="text-kumo-default text-sm font-medium">
          Scroll behavior — instant
        </h2>
        <p className="text-kumo-subtle text-xs">
          Scrolls to top instantly after each search update.
        </p>
        <SearchBar
          adapter={adapter}
          paramName="keyword"
          clearable
          resetScroll={true}
        />
      </section>

      {/* Client-side search */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Client-side search
        </h2>
        <SearchBar
          adapter={adapter}
          paramName="users"
          clearable
          placeholder="Search by name or role..."
          resetScroll={false}
        />
        <p className="text-kumo-subtle text-xs">
          {filteredUsers.length} of {MOCK_USERS.length} users shown
        </p>
        {filteredUsers.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className="bg-kumo-tint flex items-center justify-between rounded-md px-3 py-2 text-sm"
              >
                <span className="text-kumo-default">{user.name}</span>
                <span className="text-kumo-subtle text-xs">{user.role}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-kumo-subtle text-sm">
            No users match "{search.users}"
          </p>
        )}
      </section>
    </div>
  )
}

export const Route = createFileRoute('/test-search')({
  validateSearch: searchSchema,
  component: SearchTestPage,
})
