import { createFileRoute } from '@tanstack/react-router'
import { OCRModule } from '@/features/ocr'

export const Route = createFileRoute('/_authenticated/ocr')({
  component: OCRModule,
})
