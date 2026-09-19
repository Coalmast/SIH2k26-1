import { createFileRoute } from '@tanstack/react-router'
import { AttendanceManagementModule } from '@/features/contractors/AttendanceManagementModule'

export const Route = createFileRoute('/_authenticated/attendance')({
  component: AttendanceManagementModule,
})
