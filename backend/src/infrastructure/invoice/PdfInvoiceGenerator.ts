import PDFDocument from 'pdfkit';
import { InvoiceGenerator, InvoiceData } from '@domain/ports/InvoiceGenerator';
import { Mailer } from '@domain/ports/Mailer';
import { prisma } from '@infra/prisma/client';
import { logger } from '../logging/logger';
import fs from 'fs/promises';
import path from 'path';

export class PdfInvoiceGenerator implements InvoiceGenerator {
  constructor(private mailer: Mailer) {}

  async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const sequence = await prisma.invoiceSequence.upsert({
      where: { year },
      update: {
        last: {
          increment: 1,
        },
      },
      create: {
        year,
        last: 1,
      },
    });

    return `FF-${year}-${String(sequence.last).padStart(6, '0')}`;
  }

  async generatePDF(data: InvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(20)
        .text('FACTURE', { align: 'center' })
        .moveDown();

      doc
        .fontSize(10)
        .text('Forge Fitness', { align: 'left' })
        .text('Adresse de l\'entreprise')
        .text('Email: contact@forgefitness.fr')
        .moveDown();

      doc
        .fontSize(10)
        .text(`Facture N° : ${data.invoiceNumber}`, { align: 'right' })
        .text(`Commande N° : ${data.orderNumber}`, { align: 'right' })
        .text(`Date : ${data.orderDate.toLocaleDateString('fr-FR')}`, { align: 'right' })
        .moveDown(2);

      doc
        .fontSize(12)
        .text('Facturé à :', { underline: true })
        .fontSize(10)
        .text(data.customerName)
        .text(data.customerEmail)
        .moveDown(2);

      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 250;
      const col3X = 320;
      const col4X = 380;
      const col5X = 450;

      doc
        .fontSize(10)
        .text('Article', col1X, tableTop)
        .text('Qté', col2X, tableTop)
        .text('Prix HT', col3X, tableTop)
        .text('TVA', col4X, tableTop)
        .text('Total TTC', col5X, tableTop);

      doc.moveTo(col1X, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      data.items.forEach((item) => {
        const y = doc.y;
        doc
          .fontSize(9)
          .text(item.productName, col1X, y, { width: 180 })
          .text(item.quantity.toString(), col2X, y)
          .text(`${item.priceHT.toFixed(2)}€`, col3X, y)
          .text(`${item.tvaRate}%`, col4X, y)
          .text(`${item.totalTTC.toFixed(2)}€`, col5X, y);
        doc.moveDown(0.5);
      });

      doc.moveDown();
      doc.moveTo(col1X, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      const totalsX = 400;
      doc
        .fontSize(10)
        .text(`Total HT:`, totalsX, doc.y)
        .text(`${data.totalHT.toFixed(2)}€`, 500, doc.y, { align: 'right' })
        .moveDown(0.5)
        .text(`Total TVA:`, totalsX, doc.y)
        .text(`${data.totalTVA.toFixed(2)}€`, 500, doc.y, { align: 'right' })
        .moveDown(0.5)
        .fontSize(12)
        .text(`Total TTC:`, totalsX, doc.y)
        .text(`${data.totalTTC.toFixed(2)}€`, 500, doc.y, { align: 'right' });

      doc.end();
    });
  }

  async savePDF(buffer: Buffer, invoiceNumber: string): Promise<string> {
    const invoicesDir = path.join(process.cwd(), 'invoices');
    
    try {
      await fs.mkdir(invoicesDir, { recursive: true });
    } catch (error) {
      logger.error({ error }, 'Erreur création dossier invoices');
    }

    const filename = `${invoiceNumber}.pdf`;
    const filepath = path.join(invoicesDir, filename);

    await fs.writeFile(filepath, buffer);

    logger.info({ invoiceNumber, filepath }, 'Facture PDF sauvegardée');

    return `/invoices/${filename}`;
  }

  async sendByEmail(pdfUrl: string, customerEmail: string, invoiceNumber: string): Promise<void> {
    try {
      await this.mailer.send({
        to: { email: customerEmail },
        subject: `Facture ${invoiceNumber} - Forge Fitness`,
        html: `
          <p>Bonjour,</p>
          <p>Veuillez trouver ci-joint votre facture ${invoiceNumber}.</p>
          <p>Vous pouvez également la télécharger ici : <a href="${pdfUrl}">${pdfUrl}</a></p>
          <p>Merci pour votre commande !</p>
          <p>L'équipe Forge Fitness</p>
        `,
      });

      logger.info({ invoiceNumber, customerEmail }, 'Facture envoyée par email');
    } catch (error) {
      logger.error({ error, invoiceNumber, customerEmail }, 'Erreur envoi email facture');
      throw error;
    }
  }
}

