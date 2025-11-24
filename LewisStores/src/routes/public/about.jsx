import { createFileRoute } from '@tanstack/react-router'
import AboutPage from '@/components/AboutPage'

export const Route = createFileRoute('/public/about')({
  component: About,
})

function About() {
  return <AboutPage />
}