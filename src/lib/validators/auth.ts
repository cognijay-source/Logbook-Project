import { z } from 'zod'

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === '' ? undefined : v))

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: optionalString,
})

export type Login = z.infer<typeof loginSchema>
export type Signup = z.infer<typeof signupSchema>
