import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    const localSecret = process.env.REVALIDATION_SECRET;
    if (!localSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    if (secret !== localSecret) {
      return NextResponse.json(
        { message: 'Invalid revalidation secret' },
        { status: 401 }
      );
    }

    // Revalidate critical visitor landing and blogging routes
    revalidatePath('/');
    revalidatePath('/blogs');
    revalidatePath('/blogs/[slug]', 'page');
    revalidatePath('/p/[slug]', 'page');

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      message: 'Paths revalidated successfully'
    });
  } catch (err: any) {
    console.error('Revalidation error:', err);
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
