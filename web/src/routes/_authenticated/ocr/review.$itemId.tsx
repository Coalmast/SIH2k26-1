import { createFileRoute } from '@tanstack/react-router'
import { OCRReviewScreen } from '@/features/ocr/OCRReviewScreen'

export const Route = createFileRoute('/_authenticated/ocr/review/$itemId')({
  component: OCRReviewScreen,
})
