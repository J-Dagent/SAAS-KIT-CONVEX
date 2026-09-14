import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
    getConvexQueryClient: (convexUrl: string) =>
      connectConvex(queryClient, convexUrl),
  }
}

export type RouterQueryContext = ReturnType<typeof getContext>

const convexClients = new WeakMap<
  QueryClient,
  { convexQueryClient: ConvexQueryClient; convexUrl: string }
>()

export function connectConvex(
  queryClient: QueryClient,
  convexUrl: string,
) {
  const existing = convexClients.get(queryClient)
  if (existing) {
    if (existing.convexUrl !== convexUrl) {
      throw new Error('The Convex deployment changed during this session.')
    }
    return existing.convexQueryClient
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl)
  queryClient.setDefaultOptions({
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  })
  convexQueryClient.connect(queryClient)
  convexClients.set(queryClient, { convexQueryClient, convexUrl })
  return convexQueryClient
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
