import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_ADMIN_EMAIL: z.string().email().optional(),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email(),
  // Private key may contain literal \n or actual newlines
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  REVALIDATION_SECRET: z.string().optional(),
  // Node env
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables in admin panel:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
