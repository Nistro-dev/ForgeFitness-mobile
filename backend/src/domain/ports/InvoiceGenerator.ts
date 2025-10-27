export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productName: string;
    quantity: number;
    priceHT: number;
    tvaRate: number;
    totalHT: number;
    totalTTC: number;
  }>;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

export interface InvoiceGenerator {
  generateInvoiceNumber(): Promise<string>;
  generatePDF(data: InvoiceData): Promise<Buffer>;
  savePDF(buffer: Buffer, invoiceNumber: string): Promise<string>;
  sendByEmail(pdfUrl: string, customerEmail: string, invoiceNumber: string): Promise<void>;
}

