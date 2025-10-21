import nodemailer, { Transporter } from "nodemailer";
import { env } from "../../config/env";
import type { MailAddress, Mailer } from "../../domain/ports/Mailer";

export class NodemailerMailer implements Mailer {
  private transporter: Transporter;
  private readonly defaultFrom: MailAddress;

  constructor() {
    const isPort465 = Number(env.MAIL_SMTP_PORT) === 465;

    this.transporter = nodemailer.createTransport({
      host: env.MAIL_SMTP_HOST,
      port: Number(env.MAIL_SMTP_PORT),
      secure: isPort465,
      auth:
        env.MAIL_SMTP_USER && env.MAIL_SMTP_PASS
          ? {
              user: env.MAIL_SMTP_USER,
              pass: env.MAIL_SMTP_PASS,
            }
          : undefined,
    });

    const { MAIL_FROM, MAIL_SMTP_USER } = env;
    const parsed = MAIL_FROM?.match(/^(.*)<(.*)>$/);
    this.defaultFrom = parsed
      ? { name: parsed[1].trim(), email: parsed[2].trim() }
      : { email: MAIL_FROM || MAIL_SMTP_USER || "no-reply@example.com" };
  }

  async send(params: {
    to: MailAddress;
    subject: string;
    html: string;
    text?: string;
    fromOverride?: MailAddress;
  }): Promise<void> {
    const from = params.fromOverride ?? this.defaultFrom;
    await this.transporter.sendMail({
      from: from.name ? `"${from.name}" <${from.email}>` : from.email,
      to: params.to.name
        ? `"${params.to.name}" <${params.to.email}>`
        : params.to.email,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }
}