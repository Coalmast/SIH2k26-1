import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/security/overrides')({
  component: () => <div className="p-8 text-white">Security Overrides Page (WIP)</div>,
})
