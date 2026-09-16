import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/regulator/reports')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Statutory Documents & Returns</h1>
      <p className="text-slate-500 mt-2">Blockchain-verified statutory reports and returns submitted by mines.</p>
    </div>
  ),
})
