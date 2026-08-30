import { z } from 'zod'

export const userSchema = z.object({
  id: z.string(),
  keycloak_subject: z.string().optional().nullable(),
  full_name: z.string(),
  email: z.string().email().optional().nullable(),
  designation: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  mine_id: z.string().optional().nullable(),
  subsidiary_id: z.string().optional().nullable(),
  roles: z.array(z.string()),
  created_at: z.string(),
})

export type User = z.infer<typeof userSchema>
