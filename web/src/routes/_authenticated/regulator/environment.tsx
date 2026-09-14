import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/regulator/environment')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground">Environmental Clearance (EC) Conditions</h1>
      <p className="text-muted-foreground mt-2">Real-time monitoring of CAAQMS and water quality against statutory limits.</p>
    </div>
  ),
})
