import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { Pagination } from '@registry/ui/pagination'
import type { PaginationRouterAdapter } from '@registry/ui/pagination'
import { getSliceRange } from '@registry/lib/pagination/validation'
import { useState } from 'react'
import { z } from 'zod'

const searchSchema = z.object({
  page: z.coerce.number().optional(),
  simplePage: z.coerce.number().optional(),
  serverPage: z.coerce.number().optional(),
  smoothPage: z.coerce.number().optional(),
  rangePage: z.coerce.number().optional(),
  wordsPage: z.coerce.number().optional(),
  sizePage: z.coerce.number().optional(),
})

const MOCK_USERS = Array.from({ length: 83 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  role: ['Admin', 'Editor', 'Viewer'][i % 3],
}))

const PAGE_SIZE = 10

function PaginationTestPage() {
  const router = useRouter()
  const search = useSearch({ from: '/test-pagination' })
  const searchParams = search as Record<string, number | undefined>
  const [pageSize, setPageSize] = useState(10)

  function makeAdapter(paramName: string): PaginationRouterAdapter {
    return {
      getParam: (key) => String(searchParams[key] ?? ''),
      setParam: (key, value, resetScroll) =>
        router
          .navigate({
            from: '/test-pagination',
            resetScroll:
              resetScroll === 'smooth' ? false : (resetScroll ?? false),
            // @ts-expect-error — TanStack Router strict global type intersection
            search: (prev) => ({ ...prev, [key]: Number(value) }) as any,
          })
          .then(() => {
            if (resetScroll === 'smooth') {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }),
    }
  }

  const currentPage = searchParams['page'] ?? 1
  const { start, end } = getSliceRange(currentPage, PAGE_SIZE)
  const visibleUsers = MOCK_USERS.slice(start, end)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-10 p-8">
      <h1 className="text-kumo-strong text-xl font-semibold">
        Pagination Test
      </h1>

      {/* Client-side pagination */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Client-side pagination — full controls (default)
        </h2>
        <p className="text-kumo-subtle text-xs">
          {MOCK_USERS.length} total users — {PAGE_SIZE} per page
        </p>
        <ul className="flex flex-col gap-1">
          {visibleUsers.map((user) => (
            <li
              key={user.id}
              className="bg-kumo-tint flex items-center justify-between rounded-md px-3 py-2 text-sm"
            >
              <span className="text-kumo-default">{user.name}</span>
              <span className="text-kumo-subtle text-xs">{user.role}</span>
            </li>
          ))}
        </ul>
        <Pagination
          adapter={makeAdapter('page')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="page"
        />
      </section>

      {/* Simple controls */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Simple controls
        </h2>
        <Pagination
          adapter={makeAdapter('simplePage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="simplePage"
          controls="simple"
        />
      </section>

      {/* Page size dropdown */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          With page size dropdown
        </h2>
        <p className="text-kumo-subtle text-xs">
          Current page size: {pageSize}
        </p>
        <Pagination
          adapter={makeAdapter('sizePage')}
          totalItems={MOCK_USERS.length}
          pageSize={pageSize}
          pageParamName="sizePage"
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </section>

      {/* Range mode — arrows */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Range mode — arrows (default)
        </h2>
        <Pagination
          adapter={makeAdapter('rangePage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="rangePage"
          controls="range"
        />
      </section>

      {/* Range mode — words */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Range mode — word labels
        </h2>
        <Pagination
          adapter={makeAdapter('wordsPage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="wordsPage"
          controls="range"
          prevNextAs="words"
          prevNextLabels={{ previous: 'Prev', next: 'Next' }}
        />
      </section>

      {/* Range mode — siblings=2 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Range mode — siblings=2
        </h2>
        <Pagination
          adapter={makeAdapter('rangePage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="rangePage"
          controls="range"
          siblings={2}
          prevNextAs="words"
        />
      </section>

      {/* Server-side pagination */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Server-side pagination (onPageChange callback)
        </h2>
        <p className="text-kumo-subtle text-xs">
          Check the console for the onPageChange callback firing.
        </p>
        <Pagination
          adapter={makeAdapter('serverPage')}
          totalItems={200}
          pageSize={20}
          pageParamName="serverPage"
          onPageChange={(page) => console.log('onPageChange fired:', page)}
        />
      </section>

      {/* Smooth scroll */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Smooth scroll reset
        </h2>
        <Pagination
          adapter={makeAdapter('smoothPage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="smoothPage"
          resetScroll="smooth"
        />
      </section>

      {/* Custom classNames */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Custom classNames — range mode
        </h2>
        <Pagination
          adapter={makeAdapter('rangePage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="rangePage"
          controls="range"
          prevNextAs="words"
          classNames={{
            root: 'justify-center',
            rangeContainer: 'gap-2',
            ellipsis: 'text-kumo-subtle',
          }}
        />
      </section>

      {/* Dropdown page selector */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Dropdown page selector
        </h2>
        <Pagination
          adapter={makeAdapter('rangePage')}
          totalItems={MOCK_USERS.length}
          pageSize={PAGE_SIZE}
          pageParamName="rangePage"
          pageSelector="dropdown"
        />
      </section>

      {/* Dropdown page selector + page size dropdown */}
      <section className="flex flex-col gap-3">
        <h2 className="text-kumo-default text-sm font-medium">
          Dropdown page selector + page size dropdown
        </h2>
        <Pagination
          adapter={makeAdapter('sizePage')}
          totalItems={MOCK_USERS.length}
          pageSize={pageSize}
          pageParamName="sizePage"
          pageSelector="dropdown"
          pageSizeOptions={[10, 20, 50]}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </section>
    </div>
  )
}

export const Route = createFileRoute('/test-pagination')({
  validateSearch: searchSchema,
  component: PaginationTestPage,
})
