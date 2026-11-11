import { createFileRoute } from '@tanstack/react-router'
import { ConvexRealtimeDemo } from '@/components/demo'

export const Route = createFileRoute('/_auth/app/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <p>Bienvenue dans votre espace.</p>
      <ConvexRealtimeDemo />
    </div>
  )
}
