import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/regulator/incidents')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">Form 4-A / 4-B Incident Records</h1>
      <p className="text-muted-foreground mt-2">Statutory incident reporting repository for regulatory review.</p>
    </div>
  ),
})
