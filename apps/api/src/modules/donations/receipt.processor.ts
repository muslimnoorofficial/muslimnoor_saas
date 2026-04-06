import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import PDFDocument from 'pdfkit';
import { Resend } from 'resend';
import { SupabaseService } from '../supabase/supabase.service';

@Processor('receipts')
export class ReceiptProcessor extends WorkerHost {
  private readonly logger = new Logger(ReceiptProcessor.name);
  private resend: Resend | null;

  constructor(private supabase: SupabaseService) {
    super();
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      this.resend = new Resend(resendKey);
      this.logger.log('✅ Resend email service initialized');
    } else {
      this.resend = null;
      this.logger.warn('⚠️ Resend API key not configured, receipts will not be emailed');
    }
  }

  async process(job: Job<{ donation_id: string; mosque_id: string; user_id: string | null }>) {
    const { donation_id, mosque_id } = job.data;

    const { data: donation } = await this.supabase.client
      .from('donations')
      .select('*')
      .eq('id', donation_id)
      .single();

    if (!donation || donation.status !== 'completed' || donation.receipt_sent_at) {
      this.logger.warn(`Skipping receipt for donation ${donation_id}`);
      return;
    }

    if (!donation.donor_email) {
      this.logger.warn(`No donor email for donation ${donation_id} — skipping receipt`);
      return;
    }

    const { data: mosque } = await this.supabase.client
      .from('mosques')
      .select('name, logo_url, ein, city, country, timezone')
      .eq('id', mosque_id)
      .single();

    // Generate PDF buffer
    const pdfBuffer = await this.generateReceiptPdf(donation, mosque);

    // Upload to Supabase Storage
    const fileName = `receipts/${mosque_id}/${donation_id}.pdf`;
    await this.supabase.client.storage
      .from('donation-receipts')
      .upload(fileName, pdfBuffer, { contentType: 'application/pdf', upsert: true });

    const { data: urlData } = this.supabase.client.storage
      .from('donation-receipts')
      .getPublicUrl(fileName);

    // Send email via Resend (if configured)
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: `${mosque?.name ?? 'Muslim Noor'} <receipts@muslimnoor.com>`,
          to: donation.donor_email,
          subject: `Donation Receipt — ${mosque?.name ?? 'Mosque'} — $${(donation.amount / 100).toFixed(2)}`,
          html: this.buildReceiptEmailHtml(donation, mosque, urlData.publicUrl),
          attachments: [
            {
              filename: `receipt-${donation_id.substring(0, 8)}.pdf`,
              content: pdfBuffer.toString('base64'),
            },
          ],
        });
        this.logger.log(`✅ Receipt email sent for donation ${donation_id}`);
      } catch (err) {
        this.logger.error(`❌ Failed to send receipt email: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      this.logger.warn(`⏭️ Resend not configured, skipping email for donation ${donation_id}`);
    }

    await this.supabase.client
      .from('donations')
      .update({ receipt_sent_at: new Date().toISOString() })
      .eq('id', donation_id);

    this.logger.log(`Receipt sent for donation ${donation_id} → ${donation.donor_email}`);
  }

  private generateReceiptPdf(donation: any, mosque: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const amount = `$${(donation.amount / 100).toFixed(2)} USD`;
      const date = new Date(donation.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      // Header
      doc.fontSize(22).font('Helvetica-Bold').text(mosque?.name ?? 'Mosque', { align: 'center' });
      doc.fontSize(11).font('Helvetica').text('Donation Receipt', { align: 'center' });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Receipt details
      const rows = [
        ['Receipt #',       donation.id.substring(0, 8).toUpperCase()],
        ['Date',            date],
        ['Donor',           donation.donor_name ?? 'Anonymous'],
        ['Amount',          amount],
        ['Purpose',         donation.purpose.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())],
        ['Donation Type',   donation.donation_type === 'monthly' ? 'Monthly Recurring' : 'One-Time'],
      ];

      rows.forEach(([label, value]) => {
        doc.font('Helvetica-Bold').fontSize(10).text(label + ':', 50, doc.y, { continued: true, width: 150 });
        doc.font('Helvetica').text(value, { align: 'left' });
      });

      doc.moveDown(2);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown();

      // Tax note
      const taxNote = mosque?.ein
        ? `This organization is tax-exempt under IRC Section 501(c)(3). EIN: ${mosque.ein}. No goods or services were provided in exchange for this donation. This receipt may be used for tax purposes.`
        : 'Please consult a tax advisor regarding the deductibility of this donation.';

      doc.fontSize(9).font('Helvetica').fillColor('#555555').text(taxNote, { align: 'left' });

      doc.end();
    });
  }

  private buildReceiptEmailHtml(donation: any, mosque: any, receiptUrl: string): string {
    const amount = `$${(donation.amount / 100).toFixed(2)}`;
    const mosqueName = mosque?.name ?? 'the Mosque';
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #f9f7f4; padding: 40px; color: #1a1a1a;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1a3c2e; padding: 32px; text-align: center;">
      <h1 style="color: #f5e6c8; margin: 0; font-size: 22px; letter-spacing: 0.5px;">${mosqueName}</h1>
      <p style="color: #a8c5b0; margin: 8px 0 0; font-size: 13px;">Donation Receipt</p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 15px;">Assalamu Alaikum, <strong>${donation.donor_name ?? 'Dear Donor'}</strong>,</p>
      <p style="font-size: 14px; color: #444; line-height: 1.6;">
        JazakAllah Khair for your generous donation of <strong>${amount}</strong> to ${mosqueName}.
        May Allah accept your contribution and bless you abundantly.
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
        <tr style="background: #f5f0e8;"><td style="padding: 10px 14px; font-weight: bold;">Amount</td><td style="padding: 10px 14px;">${amount} USD</td></tr>
        <tr><td style="padding: 10px 14px; font-weight: bold;">Purpose</td><td style="padding: 10px 14px;">${donation.purpose}</td></tr>
        <tr style="background: #f5f0e8;"><td style="padding: 10px 14px; font-weight: bold;">Type</td><td style="padding: 10px 14px;">${donation.donation_type === 'monthly' ? 'Monthly Recurring' : 'One-Time'}</td></tr>
        <tr><td style="padding: 10px 14px; font-weight: bold;">Date</td><td style="padding: 10px 14px;">${new Date(donation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
      </table>
      <a href="${receiptUrl}" style="display: inline-block; background: #1a3c2e; color: #f5e6c8; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px;">Download PDF Receipt</a>
      ${mosque?.ein ? `<p style="margin-top: 24px; font-size: 11px; color: #888;">This organization is tax-exempt under IRC Section 501(c)(3). EIN: ${mosque.ein}. No goods or services were provided in exchange for this donation.</p>` : ''}
    </div>
  </div>
</body>
</html>`;
  }
}
