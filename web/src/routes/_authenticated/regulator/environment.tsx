import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/regulator/environment')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Environmental Clearance (EC) Conditions</h1>
      <p className="text-slate-500 mt-2">Real-time monitoring of CAAQMS and water quality against statutory limits.</p>
    </div>
  ),
})
