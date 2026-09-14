import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/security/logs')({
  component: () => <div className="p-8 text-foreground">Security Logs Page (WIP)</div>,
})
