import OrdersManagement from '@/components/OrdersManagement'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/manage/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <OrdersManagement />
}
