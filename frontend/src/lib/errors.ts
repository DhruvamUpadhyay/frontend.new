import { NextResponse } from 'next/server';
import { z } from 'zod';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function apiHandler(handler: (request: Request) => Promise<NextResponse | Response>) {
  return async (request: Request): Promise<NextResponse | Response> => {
    try {
      return await handler(request);
    } catch (err: any) {
      if (err instanceof z.ZodError || err?.name === 'ZodError') {
        const message = err.errors?.[0]?.message || err.issues?.[0]?.message || 'Validation failed';
        return NextResponse.json(
          { success: false, error: message },
          { status: 400 }
        );
      }

      if (err instanceof AppError) {
        return NextResponse.json(
          { success: false, error: err.message },
          { status: err.statusCode }
        );
      }

      const message = err instanceof Error ? err.message : 'Internal Server Error';
      console.error('API Error:', message);

      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  };
}
