import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/productDetail')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/productDetail"!</div>
}
