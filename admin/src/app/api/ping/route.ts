import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ping: 'pong' });
}

export async function POST() {
  return NextResponse.json({ ping: 'pong-post' });
}
