import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateInvoice = (order) => {
  const invoicesDir = path.resolve("invoices");

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
  }

  const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(22).text("IronSwift Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`Invoice ID: ${order._id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Customer: ${order.customerName}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  doc.text("Items:");
  order.items.forEach((item, index) => {
    doc.text(`${index + 1}. ${item}`);
  });

  doc.moveDown();
  doc.text(`Piece Count: ${order.pieceCount}`);
  doc.text(`Eco Steam: ${order.ecoSteam ? "Yes" : "No"}`);
  doc.text(`Total Paid: ₹${order.totalPrice}`);
  doc.moveDown();

  doc.text("Thank you for choosing IronSwift!", { align: "center" });

  doc.end();

  return filePath;
};

export default generateInvoice;
