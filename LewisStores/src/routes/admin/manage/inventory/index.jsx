import { createFileRoute } from '@tanstack/react-router'
import Inventory from '@/components/Inventory'

export const Route = createFileRoute('/admin/manage/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Inventory />
}
