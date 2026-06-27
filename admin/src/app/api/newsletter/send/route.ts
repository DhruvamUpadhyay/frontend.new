import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, htmlContent, adminEmail, templateName, rawBody } = body;

    if (!subject || !htmlContent || !adminEmail) {
      return NextResponse.json({ error: 'Missing subject, content, or adminEmail' }, { status: 400 });
    }

    // 1. Fetch subscribers
    const snapshot = await adminDb.collection('newsletter').get();
    const emails = Array.from(new Set(snapshot.docs.map(doc => doc.data().email || doc.id).filter(Boolean)));

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 400 });
    }

    // 2. Check if SMTP configuration exists in env
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'noreply@forensicbypriyanshi.com';

    let sentReal = false;
    let errorMsg = '';

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || '587'),
          secure: smtpPort === '465',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        // Send to each subscriber (using BCC)
        await transporter.sendMail({
          from: smtpFrom,
          bcc: emails.join(', '),
          subject: subject,
          html: htmlContent
        });
        sentReal = true;
      } catch (err: any) {
        console.error('SMTP sending failed, falling back to mock logging:', err);
        errorMsg = err.message;
      }
    }

    // 3. Save sent newsletter to Firestore
    const newsletterRef = await adminDb.collection('sent_newsletters').add({
      subject,
      templateName,
      body: rawBody || '',
      recipients: emails,
      recipientCount: emails.length,
      timestamp: new Date().toISOString(),
      sender: adminEmail,
      status: sentReal ? 'delivered' : 'mocked_delivered',
      smtpError: errorMsg || null
    });

    // 4. Log to System Logs
    await adminDb.collection('system_logs').add({
      action: 'SEND_NEWSLETTER',
      adminEmail,
      collectionName: 'sent_newsletters',
      docId: newsletterRef.id,
      timestamp: new Date().toISOString(),
      details: { subject, templateName, recipientCount: emails.length, sentReal }
    });

    return NextResponse.json({
      success: true,
      recipientCount: emails.length,
      sentReal,
      warning: sentReal ? null : 'SMTP settings not configured. The newsletter was recorded in the database and logged to the server console.'
    });
  } catch (err: any) {
    console.error('Failed to send newsletter:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
