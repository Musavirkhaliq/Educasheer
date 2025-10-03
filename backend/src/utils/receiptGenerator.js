import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateReceipt = async (order, user) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });
            
            // Create a buffer to store the PDF
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });

            // Header
            doc.fontSize(20)
               .fillColor('#2563eb')
               .text('EDUCASHEER', 50, 50)
               .fontSize(12)
               .fillColor('#666666')
               .text('Digital Learning Platform', 50, 75);

            // Receipt title
            doc.fontSize(18)
               .fillColor('#000000')
               .text('PAYMENT RECEIPT', 50, 120);

            // Order details
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            doc.fontSize(12)
               .text(`Receipt No: ${order.orderId}`, 50, 160)
               .text(`Date: ${orderDate}`, 50, 180)
               .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, 200);

            // Customer details
            doc.fontSize(14)
               .fillColor('#2563eb')
               .text('CUSTOMER DETAILS', 50, 240);

            doc.fontSize(12)
               .fillColor('#000000')
               .text(`Name: ${user.fullName || user.username}`, 50, 265)
               .text(`Email: ${user.email}`, 50, 285);

            // Items table header
            doc.fontSize(14)
               .fillColor('#2563eb')
               .text('PURCHASED ITEMS', 50, 325);

            // Table headers
            const tableTop = 350;
            doc.fontSize(10)
               .fillColor('#000000')
               .text('Item', 50, tableTop)
               .text('Type', 250, tableTop)
               .text('Original Price', 350, tableTop)
               .text('Final Price', 450, tableTop);

            // Draw line under headers
            doc.moveTo(50, tableTop + 15)
               .lineTo(550, tableTop + 15)
               .stroke();

            // Items
            let yPosition = tableTop + 25;
            order.items.forEach((item, index) => {
                doc.fontSize(9)
                   .text(item.title.substring(0, 30) + (item.title.length > 30 ? '...' : ''), 50, yPosition)
                   .text(item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1), 250, yPosition)
                   .text(`₹${item.originalPrice}`, 350, yPosition)
                   .text(`₹${item.price}`, 450, yPosition);
                
                yPosition += 20;
            });

            // Summary
            yPosition += 20;
            doc.moveTo(50, yPosition)
               .lineTo(550, yPosition)
               .stroke();

            yPosition += 15;
            doc.fontSize(11)
               .text(`Subtotal: ₹${order.subtotal}`, 350, yPosition);

            if (order.discount > 0) {
                yPosition += 20;
                doc.text(`Discount: -₹${order.discount}`, 350, yPosition);
                if (order.promoCode && order.promoCode.code) {
                    doc.fontSize(9)
                       .fillColor('#666666')
                       .text(`(Promo: ${order.promoCode.code})`, 450, yPosition);
                }
            }

            yPosition += 20;
            doc.fontSize(12)
               .fillColor('#000000')
               .text(`Total Amount: ₹${order.totalAmount}`, 350, yPosition);

            // Payment details
            if (order.paymentMethod !== 'free') {
                yPosition += 40;
                doc.fontSize(12)
                   .fillColor('#2563eb')
                   .text('PAYMENT DETAILS', 50, yPosition);

                yPosition += 20;
                doc.fontSize(10)
                   .fillColor('#000000')
                   .text(`Payment Method: ${order.paymentMethod.toUpperCase()}`, 50, yPosition);

                if (order.paymentId) {
                    yPosition += 15;
                    doc.text(`Transaction ID: ${order.paymentId}`, 50, yPosition);
                }
            }

            // Footer
            const footerY = doc.page.height - 100;
            doc.fontSize(10)
               .fillColor('#666666')
               .text('Thank you for choosing Educasheer!', 50, footerY)
               .text('For support, contact us at support@educasheer.com', 50, footerY + 15)
               .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, footerY + 30);

            // Finalize the PDF
            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};

export const generateReceiptHTML = (order, user) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Receipt - ${order.orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .receipt { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
            .company-tagline { color: #666; font-size: 14px; }
            .receipt-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-align: center; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-section h3 { color: #2563eb; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .info-section p { margin: 5px 0; color: #333; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; }
            .items-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .summary { text-align: right; margin-top: 20px; }
            .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total-row { font-weight: bold; font-size: 18px; color: #2563eb; border-top: 2px solid #2563eb; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
            @media print { body { background: white; } .receipt { box-shadow: none; } }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="company-name">EDUCASHEER</div>
                <div class="company-tagline">Digital Learning Platform</div>
            </div>

            <div class="receipt-title">PAYMENT RECEIPT</div>

            <div class="info-grid">
                <div class="info-section">
                    <h3>Order Details</h3>
                    <p><strong>Receipt No:</strong> ${order.orderId}</p>
                    <p><strong>Date:</strong> ${orderDate}</p>
                    <p><strong>Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
                </div>
                <div class="info-section">
                    <h3>Customer Details</h3>
                    <p><strong>Name:</strong> ${user.fullName || user.username}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                </div>
            </div>

            <h3 style="color: #2563eb; margin-bottom: 15px;">Purchased Items</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Original Price</th>
                        <th>Final Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}</td>
                            <td>₹${item.originalPrice}</td>
                            <td>₹${item.price}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal}</span>
                </div>
                ${order.discount > 0 ? `
                    <div class="summary-row">
                        <span>Discount ${order.promoCode?.code ? `(${order.promoCode.code})` : ''}:</span>
                        <span>-₹${order.discount}</span>
                    </div>
                ` : ''}
                <div class="summary-row total-row">
                    <span>Total Amount:</span>
                    <span>₹${order.totalAmount}</span>
                </div>
            </div>

            ${order.paymentMethod !== 'free' ? `
                <div style="margin-top: 30px;">
                    <h3 style="color: #2563eb;">Payment Details</h3>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                    ${order.paymentId ? `<p><strong>Transaction ID:</strong> ${order.paymentId}</p>` : ''}
                </div>
            ` : ''}

            <div class="footer">
                <p>Thank you for choosing Educasheer!</p>
                <p>For support, contact us at support@educasheer.com</p>
                <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
            </div>
        </div>
    </body>
    </html>
    `;
};