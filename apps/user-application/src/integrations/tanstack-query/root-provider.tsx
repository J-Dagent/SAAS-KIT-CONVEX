import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProvider } from 'convex/react'

export function getContext() {
  const convexQueryClient = new ConvexQueryClient(
    import.meta.env.VITE_CONVEX_URL,
  )
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  })
  convexQueryClient.connect(queryClient)
  return { queryClient, convexQueryClient }
}

export type RouterQueryContext = ReturnType<typeof getContext>

export function Provider({
  children,
  queryClient,
  convexQueryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProvider client={convexQueryClient.convexClient}>
        {children}
      </ConvexProvider>
    </QueryClientProvider>
  )
}
