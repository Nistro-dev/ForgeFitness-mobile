import nodemailer from 'nodemailer';
import { env } from '@config';
export class NodemailerMailer {
    transporter = nodemailer.createTransport({
        host: env.MAIL_SMTP_HOST,
        port: env.MAIL_SMTP_PORT,
        secure: false,
        auth: env.MAIL_SMTP_USER
            ? { user: env.MAIL_SMTP_USER, pass: env.MAIL_SMTP_PASS }
            : undefined,
    });
    async send(to, subject, html, text) {
        await this.transporter.sendMail({
            from: 'no-reply@forge-fitness.local',
            to,
            subject,
            html,
            text,
        });
    }
}
