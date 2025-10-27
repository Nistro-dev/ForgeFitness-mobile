import { addHours } from "date-fns";
import { randomBytes } from "crypto";
import type { Mailer } from "../../domain/ports/Mailer";
import type { UserRepo } from "../../domain/ports/UserRepo";
import type { ActivationKeyRepo } from "../../domain/ports/ActivationKeyRepo";
import { renderTemplate } from "../../infrastructure/mail/templates/utils";

const EMAIL_CONFIG = {
  logoUrl: "https://raw.githubusercontent.com/Nistro-dev/ForgeFitness-mobile/refs/heads/main/backend/src/infrastructure/mail/templates/logo.png",
  appleLogoUrl: "https://raw.githubusercontent.com/Nistro-dev/ForgeFitness-mobile/refs/heads/main/backend/src/infrastructure/mail/templates/app-store.png",
  androidLogoUrl: "https://raw.githubusercontent.com/Nistro-dev/ForgeFitness-mobile/refs/heads/main/backend/src/infrastructure/mail/templates/google-play.png",
  appStoreUrl: "https://raw.githubusercontent.com/Nistro-dev/ForgeFitness-mobile/refs/heads/main/backend/src/infrastructure/mail/templates/app-store.png",
  playStoreUrl: "https://raw.githubusercontent.com/Nistro-dev/ForgeFitness-mobile/refs/heads/main/backend/src/infrastructure/mail/templates/google-play.png",
  supportEmail: "support@forge-fitness.fr",
};

export class IssueActivationKeyUseCase {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly activationKeyRepo: ActivationKeyRepo,
    private readonly mailer: Mailer
  ) {}

  async execute(input: { email: string; firstName: string; lastName: string }) {
    const email = input.email.trim().toLowerCase();
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    let user = await this.userRepo.findByEmail(email);
    if (!user) {
      user = await this.userRepo.create({ email, firstName, lastName });
    } else {
      await this.userRepo.updateNames(user.id, { firstName, lastName });
    }

    await this.activationKeyRepo.invalidateActiveForUser(user.id);

    const key = generateKey();
    const expiresAt = addHours(new Date(), 48);
    const ak = await this.activationKeyRepo.create({
      userId: user.id,
      key,
      expiresAt,
    });

    await this.userRepo.setCurrentActivationKey(user.id, ak.id);

    const emailContent = await buildActivationEmail({
      firstName,
      code: key,
    });
    const text =
      `Bonjour ${firstName},\n\n` +
      `Voici votre code d'activation: ${key}\n` +
      `Valable jusqu'au ${expiresAt.toISOString()}.\n\n` +
      `Installez l'app (App Store / Play Store) puis entrez ce code.`;

    await this.mailer.send({
      to: { email, name: `${firstName} ${lastName}`.trim() },
      subject: emailContent.subject,
      html: emailContent.html,
      text,
    });

    return {
      userId: user.id,
      email,
      expiresAt: expiresAt.toISOString(),
    };
  }
}

function generateKey(): string {
  const bytes = randomBytes(4);
  const b32 = toBase32NoPadding(bytes);
  return b32.slice(0, 6);
}

function toBase32NoPadding(bytes: Buffer | Uint8Array) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0,
    value = 0,
    output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}

async function buildActivationEmail(params: {
  firstName: string;
  code: string;
}) {
  const html = await renderTemplate("activation.html", {
    subject: `Ton code Forge Fitness: ${params.code}`,
    brandName: "Forge Fitness",
    logo: EMAIL_CONFIG.logoUrl,
    appleLogo: EMAIL_CONFIG.appleLogoUrl,
    androidLogo: EMAIL_CONFIG.androidLogoUrl,
    year: new Date().getFullYear().toString(),
    supportEmail: EMAIL_CONFIG.supportEmail,
    appStoreUrl: EMAIL_CONFIG.appStoreUrl,
    playStoreUrl: EMAIL_CONFIG.playStoreUrl,
    firstName: params.firstName,
    code: params.code,
  });

  const subject = `Ton code Forge Fitness: ${params.code}`;
  return { subject, html };
}