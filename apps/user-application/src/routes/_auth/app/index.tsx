import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/app/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Bienvenue dans votre espace.</div>
}
