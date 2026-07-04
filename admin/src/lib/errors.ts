import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Standardized application error that can be thrown anywhere in the API logic.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

/**
 * Standardized wrapper for API route handlers to catch exceptions and return a consistent JSON response.
 */
export function apiHandler(handler: (request: Request) => Promise<NextResponse | Response>) {
  return async (request: Request): Promise<NextResponse | Response> => {
    try {
      return await handler(request);
    } catch (err: any) {
      // Handle Zod Validation Errors
      if (err instanceof z.ZodError || err?.name === 'ZodError') {
        const message = err.errors?.[0]?.message || err.issues?.[0]?.message || 'Validation failed';
        return NextResponse.json(
          { success: false, error: message },
          { status: 400 }
        );
      }

      // Handle App Errors
      if (err instanceof AppError) {
        return NextResponse.json(
          { success: false, error: err.message },
          { status: err.statusCode }
        );
      }

      // Handle standard Errors
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      console.error('API Error:', message);

      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  };
}
