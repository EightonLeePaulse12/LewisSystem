import { createFileRoute } from '@tanstack/react-router'
import Inventory from '@/components/Inventory'

export const Route = createFileRoute('/manage/inventory')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Inventory />
}
