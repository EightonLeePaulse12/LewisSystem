import { createFileRoute } from '@tanstack/react-router'
import AddProduct from '@/components/AddProduct'

export const Route = createFileRoute('/(admin)/manage/inventory/add')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AddProduct />
}
