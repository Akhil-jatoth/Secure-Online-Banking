import PDFDocument from 'pdfkit';

export class PDFGenerator {
  static generateBankStatementPDF({
    bankName = 'Aegis Secure Bank',
    customerName,
    maskedAccountNumber,
    accountType,
    currency = 'USD',
    period,
    openingBalance,
    closingBalance,
    totalDebits,
    totalCredits,
    transactions = [],
  }) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Header / Brand
    doc.fillColor('#0255a3')
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(bankName.toUpperCase(), 40, 40);

    doc.fillColor('#64748b')
       .fontSize(9)
       .font('Helvetica')
       .text('Official Certified Account Statement | Academic Banking Simulation', 40, 68);

    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(40, 85).lineTo(555, 85).stroke();

    // Account Summary Box
    doc.rect(40, 95, 515, 95).fillAndStroke('#f8fafc', '#cbd5e1');

    doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('Customer Details', 55, 105);
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    doc.text(`Name: ${customerName}`, 55, 122);
    doc.text(`Account No: ${maskedAccountNumber} (${accountType})`, 55, 137);
    doc.text(`Statement Period: ${period}`, 55, 152);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 55, 167);

    doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text('Balance Summary', 330, 105);
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
    doc.text(`Opening Balance: $${openingBalance.toFixed(2)} ${currency}`, 330, 122);
    doc.text(`Total Credits (+): $${totalCredits.toFixed(2)}`, 330, 137);
    doc.text(`Total Debits (-): $${totalDebits.toFixed(2)}`, 330, 152);
    doc.font('Helvetica-Bold').fillColor('#0255a3')
       .text(`Closing Balance: $${closingBalance.toFixed(2)} ${currency}`, 330, 167);

    // Transaction Table Header
    const tableTop = 210;
    doc.rect(40, tableTop, 515, 22).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
    doc.text('Date', 50, tableTop + 6);
    doc.text('Reference #', 120, tableTop + 6);
    doc.text('Description', 215, tableTop + 6);
    doc.text('Type', 380, tableTop + 6);
    doc.text('Amount ($)', 465, tableTop + 6, { align: 'right', width: 80 });

    // Transaction Rows
    let y = tableTop + 26;
    doc.font('Helvetica').fontSize(8);

    if (transactions.length === 0) {
      doc.fillColor('#64748b').text('No transactions recorded during this statement period.', 50, y + 10);
      y += 30;
    } else {
      transactions.forEach((tx, idx) => {
        if (y > 740) {
          doc.addPage();
          y = 40;
        }

        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(40, y - 4, 515, 18).fill('#f1f5f9');
        }

        const txDate = new Date(tx.createdAt).toLocaleDateString();
        const ref = (tx.referenceNumber || tx.transactionId || '').slice(0, 15);
        const desc = (tx.description || tx.category || '').slice(0, 32);
        const isDebit = tx.direction === 'DEBIT';
        const sign = isDebit ? '-' : '+';
        const amountColor = isDebit ? '#dc2626' : '#16a34a';

        doc.fillColor('#334155').text(txDate, 50, y);
        doc.text(ref, 120, y);
        doc.text(desc, 215, y);
        doc.text(tx.type || 'TRANSFER', 380, y);

        doc.fillColor(amountColor)
           .font('Helvetica-Bold')
           .text(`${sign}$${tx.amount.toFixed(2)}`, 465, y, { align: 'right', width: 80 });

        doc.font('Helvetica');
        y += 20;
      });
    }

    // Footer
    const footerY = 780;
    doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(40, footerY).lineTo(555, footerY).stroke();
    doc.fillColor('#94a3b8').fontSize(7.5)
       .text('This is a computer-generated bank statement for academic simulation purposes only. Not valid for commercial or legal tender.', 40, footerY + 8, { align: 'center', width: 515 });

    return doc;
  }
}
