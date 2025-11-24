import { createFileRoute } from '@tanstack/react-router'
import ContactForm from '@/components/ContactForm'

export const Route = createFileRoute('/public/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ContactForm />
}
