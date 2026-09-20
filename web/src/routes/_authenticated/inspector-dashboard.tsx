import { createFileRoute } from '@tanstack/react-router';
import { InspectorDashboard } from '@/features/inspection/InspectorDashboard';

export const Route = createFileRoute('/_authenticated/inspector-dashboard')({
  component: InspectorDashboard,
})
