import { adminDb } from '@/lib/firebase-admin';
import { AppError } from '@/lib/errors';

export class NewsletterService {
  /**
   * Retrieves all unique subscriber emails.
   */
  static async getSubscribers(): Promise<string[]> {
    const snapshot = await adminDb.collection('newsletter').get();
    const emails = Array.from(new Set(snapshot.docs.map(doc => doc.data().email || doc.id).filter(Boolean)));
    return emails;
  }

  /**
   * Sends the newsletter to all subscribers and records it in Firestore.
   */
  static async sendNewsletter(subject: string, htmlContent: string, templateName: string, rawBody: string, senderEmail: string) {
    const emails = await this.getSubscribers();
    
    if (emails.length === 0) {
      throw new AppError('No subscribers found', 400);
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || 'noreply@forensicbypriyanshi.com';

    let sentReal = false;
    let errorMsg = '';

    if (smtpHost && smtpUser && smtpPass) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
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

        await transporter.sendMail({
          from: smtpFrom,
          bcc: emails.join(', '),
          subject: subject,
          html: htmlContent
        });
        sentReal = true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'SMTP error';
        console.error('SMTP sending failed, falling back to mock logging:', message);
        errorMsg = message;
      }
    }

    // Save sent newsletter to Firestore
    const newsletterRef = await adminDb.collection('sent_newsletters').add({
      subject,
      templateName,
      body: rawBody || '',
      recipients: emails,
      recipientCount: emails.length,
      timestamp: new Date().toISOString(),
      sender: senderEmail,
      status: sentReal ? 'delivered' : 'mocked_delivered',
      smtpError: errorMsg || null
    });

    // Log to System Logs
    await adminDb.collection('system_logs').add({
      action: 'SEND_NEWSLETTER',
      adminEmail: senderEmail,
      collectionName: 'sent_newsletters',
      docId: newsletterRef.id,
      timestamp: new Date().toISOString(),
      details: { subject, templateName, recipientCount: emails.length, sentReal }
    });

    return {
      recipientCount: emails.length,
      sentReal,
      warning: sentReal ? null : 'SMTP settings not configured. The newsletter was recorded in the database and logged to the server console.'
    };
  }

  /**
   * Deduplicates subscribers.
   */
  static async deduplicate(adminEmail: string) {
    const snapshot = await adminDb.collection('newsletter').get();
    
    // Group docs by normalized lowercase email
    const emailMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>();
    
    snapshot.docs.forEach(doc => {
      const email = (doc.data().email || doc.id).toLowerCase().trim();
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(doc);
    });

    let duplicateCount = 0;
    const batch = adminDb.batch();
    let batchCount = 0;

    for (const [email, docs] of emailMap.entries()) {
      if (docs.length > 1) {
        // Keep the first one (oldest usually, or just the first in snapshot)
        // Delete the rest
        for (let i = 1; i < docs.length; i++) {
          batch.delete(docs[i].ref);
          duplicateCount++;
          batchCount++;
          
          if (batchCount === 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    if (duplicateCount > 0) {
      await adminDb.collection('system_logs').add({
        action: 'CLEANUP_NEWSLETTER',
        adminEmail,
        collectionName: 'newsletter',
        timestamp: new Date().toISOString(),
        details: { removedDuplicates: duplicateCount }
      });
    }

    return { removedCount: duplicateCount };
  }
}
