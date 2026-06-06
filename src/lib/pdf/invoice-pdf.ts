import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import prisma from "@/lib/db/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateInvoicePdf(invoiceId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      items: { include: { product: true } },
      organization: true,
    },
  });

  if (!invoice) throw new Error("Invoice not found");

  const doc = new jsPDF();
  const org = invoice.organization;

  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text(org.name, 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("INVOICE", 150, 20);
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text(invoice.invoiceNumber, 150, 28);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, 150, 36);
  doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, 150, 42);
  doc.text(`Status: ${invoice.status}`, 150, 48);

  doc.setFontSize(12);
  doc.setTextColor(30);
  doc.text("Bill To:", 20, 50);
  doc.setFontSize(10);
  doc.text(invoice.customer.name, 20, 58);
  if (invoice.customer.company) doc.text(invoice.customer.company, 20, 64);
  if (invoice.customer.email) doc.text(invoice.customer.email, 20, 70);
  if (invoice.customer.address) doc.text(invoice.customer.address, 20, 76);

  autoTable(doc, {
    startY: 90,
    head: [["Description", "Qty", "Unit Price", "Total"]],
    body: invoice.items.map((item) => [
      item.description,
      item.quantity.toString(),
      formatCurrency(Number(item.unitPrice)),
      formatCurrency(Number(item.total)),
    ]),
    theme: "striped",
    headStyles: { fillColor: [79, 70, 229] },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY + 10;

  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(Number(invoice.subtotal))}`, 130, finalY);
  doc.text(`Tax: ${formatCurrency(Number(invoice.tax))}`, 130, finalY + 6);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${formatCurrency(Number(invoice.total))}`, 130, finalY + 14);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { pdfUrl: `/api/v1/invoices/${invoiceId}/pdf` },
  });

  return pdfBuffer;
}
