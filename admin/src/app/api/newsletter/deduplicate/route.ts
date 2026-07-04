import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-guard';
import { apiHandler } from '@/lib/errors';
import { NewsletterService } from '@/services/NewsletterService';

export const POST = apiHandler(async (request: Request) => {
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  const result = await NewsletterService.deduplicate(admin.email);

  return NextResponse.json({ success: true, ...result });
});
