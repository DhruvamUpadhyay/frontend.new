import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await addDoc(collection(db, 'newsletter'), { 
      email, 
      timestamp: new Date() 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
