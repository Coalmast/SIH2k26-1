import { toast } from 'sonner'

export function showSubmittedData(
  data: unknown,
  title: string = 'Settings saved successfully'
) {
  toast.success(title)
}
