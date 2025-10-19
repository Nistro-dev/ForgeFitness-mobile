import nodemailer from 'nodemailer';
import { Mailer } from '@domain/ports/Mailer';
import { env } from '@config';

export class NodemailerMailer implements Mailer {
  private transporter = nodemailer.createTransport({
    host: env.MAIL_SMTP_HOST,
    port: env.MAIL_SMTP_PORT,
    secure: false,
    auth: env.MAIL_SMTP_USER
      ? { user: env.MAIL_SMTP_USER, pass: env.MAIL_SMTP_PASS }
      : undefined,
  });

  async send(to: string, subject: string, html: string, text?: string): Promise<void> {
    await this.transporter.sendMail({
      from: 'no-reply@forge-fitness.local',
      to,
      subject,
      html,
      text,
    });
  }
}
