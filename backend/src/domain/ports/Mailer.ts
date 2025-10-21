export type MailAddress = { email: string; name?: string };

export interface Mailer {
  send(params: {
    to: MailAddress;
    subject: string;
    html: string;
    text?: string;
    fromOverride?: MailAddress;
  }): Promise<void>;
}