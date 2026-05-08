import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { env } from '../env';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;

  constructor() {
    this.resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY not set — email features (verification, password reset) are disabled. Emails will be logged to console instead.',
      );
    }
  }

  async send({ to, subject, html, text }: SendEmailParams): Promise<void> {
    if (!this.resend) {
      // Dev-friendly fallback: log the email instead of sending
      this.logger.log(
        { to, subject, html, text },
        `[email disabled] Would have sent email to ${to}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      this.logger.error({ to, subject, error }, 'Failed to send email');
      throw new Error(`Failed to send email: ${error.message}`);
    }

    this.logger.log({ to, subject }, 'Email sent');
  }
}
