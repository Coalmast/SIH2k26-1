import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/regulator/inspections')({
  component: () => (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">Regulatory Inspections (Read-Only)</h1>
      <p className="text-slate-500 mt-2">This module provides DGMS officers with read-only access to all inspection records across subsidiaries.</p>
    </div>
  ),
})
