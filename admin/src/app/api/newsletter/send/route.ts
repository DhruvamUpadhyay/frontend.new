import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-guard';
import { apiHandler, AppError } from '@/lib/errors';
import { NewsletterService } from '@/services/NewsletterService';

export const POST = apiHandler(async (request: Request) => {
  // Server-side auth: verify token + admin role
  const admin = await verifyAdmin(request);
  if (admin instanceof Response) return admin;

  const body = await request.json();
  const { subject, htmlContent, templateName, rawBody } = body;

  if (!subject || !htmlContent) {
    throw new AppError('Missing subject or content', 400);
  }

  const result = await NewsletterService.sendNewsletter(
    subject,
    htmlContent,
    templateName,
    rawBody,
    admin.email
  );

  return NextResponse.json({ success: true, ...result });
});
