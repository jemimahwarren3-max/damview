'use client'

type OrderItem = {
    name: string
    item_code?: string
    quantity: number
    price: number
}

type PrintBillData = {
    billId?: string
    hotelName?: string
    customerName: string
    guestCode: string
    roomNumber: number
    checkIn: string
    checkOut?: string
    billingMode?: 'nightly' | 'hourly'
    stayLabel?: string
    rateLabel?: string
    items: OrderItem[]
    roomCharges: number
    foodCharges: number
    extraCharges: number
    extraChargesDetails?: { name: string; amount: number }[]
    discount: number
    gstAmount: number
    gstPercent: number
    totalAmount: number
    paymentMode: string
    amountPaid?: number
    outstandingBalance?: number
}

function getStyles() {
    return `
        body { font-family: 'Courier New', monospace; padding: 15px; width: 300px; margin: 0 auto; color: #000; font-size: 12px; }
        .center { text-align: center; }
        .right { text-align: right; }
        .bold { font-weight: bold; }
        .line { border-bottom: 1px dashed #000; margin: 8px 0; }
        .double-line { border-bottom: 2px solid #000; margin: 10px 0; }
        .header { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
        .sub-header { font-size: 11px; margin-top: 2px; }
        .item-row { display: flex; justify-content: space-between; margin: 3px 0; }
        .item-name { flex: 1; }
        .item-qty { width: 40px; text-align: center; }
        .item-price { width: 70px; text-align: right; }
        .total-row { display: flex; justify-content: space-between; font-weight: bold; margin: 4px 0; }
        .grand-total { font-size: 16px; margin: 8px 0; }
        .footer { font-size: 10px; margin-top: 15px; color: #555; }
        @media print { body { margin: 0; padding: 10px; } }
    `
}

export function printKOT(order: {
    roomNumber: number
    orderId: string
    items: { name: string; quantity: number }[]
    entryMode?: string
    createdAt: string
}) {
    const w = window.open('', '_blank')
    if (!w) return

    w.document.write(`
        <html><head><title>KOT - Room ${order.roomNumber}</title>
        <style>${getStyles()} .kot-badge { padding: 2px 8px; border: 1px solid #000; font-size: 10px; letter-spacing: 1px; }</style></head>
        <body>
            <div class="center header">KITCHEN ORDER TICKET</div>
            <div class="center sub-header">${order.entryMode === 'manual' ? '[ MANUAL ENTRY ]' : '[ QR AUTO ORDER ]'}</div>
            <div class="line"></div>
            <div class="item-row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleDateString('en-US')}</span></div>
            <div class="item-row"><span>Time:</span><span>${new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div class="item-row"><span>Room:</span><span class="bold" style="font-size:18px">${order.roomNumber}</span></div>
            <div class="double-line"></div>
            <div class="center bold" style="margin-bottom:5px">ITEMS</div>
            ${order.items.map(item => `
                <div class="item-row">
                    <span class="item-name bold">${item.quantity} × ${item.name}</span>
                </div>
            `).join('')}
            <div class="double-line"></div>
            <div class="center footer">
                KOT #${order.orderId.slice(0, 8).toUpperCase()}<br>
                Printed: ${new Date().toLocaleTimeString('en-US')}
            </div>
            <script>window.print();</script>
        </body></html>
    `)
    w.document.close()
}

export function printReceiveCopy(order: {
    roomNumber: number
    orderId: string
    items: { name: string; quantity: number; price: number }[]
    total: number
    createdAt: string
}) {
    const w = window.open('', '_blank')
    if (!w) return

    w.document.write(`
        <html><head><title>Receive Copy - Room ${order.roomNumber}</title>
        <style>${getStyles()}</style></head>
        <body>
            <div class="center header">RECEIVE COPY</div>
            <div class="center sub-header">Service Desk Copy</div>
            <div class="line"></div>
            <div class="item-row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleDateString('en-US')}</span></div>
            <div class="item-row"><span>Time:</span><span>${new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
            <div class="item-row"><span>Room:</span><span class="bold" style="font-size:16px">${order.roomNumber}</span></div>
            <div class="double-line"></div>
            <div class="item-row bold"><span class="item-name">Item</span><span class="item-qty">Qty</span><span class="item-price">Amount</span></div>
            <div class="line"></div>
            ${order.items.map(item => `
                <div class="item-row">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">${item.quantity}</span>
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('')}
            <div class="double-line"></div>
            <div class="total-row"><span>Order Total:</span><span>$${order.total.toFixed(2)}</span></div>
            <div class="line"></div>
            <div class="center footer">
                Order #${order.orderId.slice(0, 8).toUpperCase()}<br>
                Printed: ${new Date().toLocaleTimeString('en-US')}
            </div>
            <script>window.print();</script>
        </body></html>
    `)
    w.document.close()
}

export function printFinalBill(data: PrintBillData) {
    const w = window.open('', '_blank')
    if (!w) return

    w.document.write(`
        <html><head><title>Bill - ${data.customerName}</title>
        <style>${getStyles()} body { width: 350px; }</style></head>
        <body>
            <div class="center header">${data.hotelName || 'HOTEL'}</div>
            <div class="center sub-header">TAX INVOICE</div>
            <div class="double-line"></div>

            <div class="item-row"><span>Guest:</span><span class="bold">${data.customerName}</span></div>
            <div class="item-row"><span>Guest Code:</span><span>${data.guestCode}</span></div>
            <div class="item-row"><span>Room No:</span><span class="bold" style="font-size:14px">${data.roomNumber}</span></div>
            <div class="item-row"><span>Check-In:</span><span>${new Date(data.checkIn).toLocaleDateString('en-US')} ${new Date(data.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
            ${data.checkOut ? `<div class="item-row"><span>Check-Out:</span><span>${new Date(data.checkOut).toLocaleDateString('en-US')} ${new Date(data.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>` : ''}
            ${data.stayLabel ? `<div class="item-row"><span>Stay:</span><span class="bold">${data.stayLabel}</span></div>` : ''}
            ${data.billingMode === 'hourly' ? '<div class="item-row"><span>Billing:</span><span>Hourly</span></div>' : ''}
            <div class="double-line"></div>

            ${data.items.length > 0 ? `
                <div class="center bold" style="margin-bottom:5px">ORDER DETAILS</div>
                <div class="item-row bold"><span class="item-name">Item</span><span class="item-qty">Qty</span><span class="item-price">Amount</span></div>
                <div class="line"></div>
                ${data.items.map(item => `
                    <div class="item-row">
                        <span class="item-name">${item.item_code ? `[${item.item_code}] ` : ''}${item.name}</span>
                        <span class="item-qty">${item.quantity}</span>
                        <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="line"></div>
            ` : ''}

            <div class="total-row"><span>Room Charges${data.rateLabel ? ` (${data.rateLabel})` : ''}:</span><span>$${data.roomCharges.toFixed(2)}</span></div>
            <div class="total-row"><span>Food Charges:</span><span>$${data.foodCharges.toFixed(2)}</span></div>

            ${(data.extraChargesDetails && data.extraChargesDetails.length > 0) ?
            data.extraChargesDetails.map(ec => `
                    <div class="total-row"><span>${ec.name}:</span><span>$${ec.amount.toFixed(2)}</span></div>
                `).join('') :
            data.extraCharges > 0 ? `<div class="total-row"><span>Extra Charges:</span><span>$${data.extraCharges.toFixed(2)}</span></div>` : ''}

            ${data.discount > 0 ? `<div class="total-row" style="color:red"><span>Discount:</span><span>-$${data.discount.toFixed(2)}</span></div>` : ''}

            <div class="total-row"><span>VAT (${data.gstPercent.toFixed(1)}%):</span><span>$${data.gstAmount.toFixed(2)}</span></div>

            <div class="double-line"></div>
            <div class="total-row grand-total"><span>TOTAL:</span><span>$${data.totalAmount.toFixed(2)}</span></div>
            <div class="item-row"><span>Payment Mode:</span><span class="bold">${data.paymentMode}</span></div>
            ${data.amountPaid !== undefined ? `<div class="total-row"><span>Amount Paid:</span><span>$${data.amountPaid.toFixed(2)}</span></div>` : ''}
            ${(data.outstandingBalance ?? 0) > 0 ? `<div class="total-row" style="color:red"><span>OUTSTANDING:</span><span>$${data.outstandingBalance!.toFixed(2)}</span></div>` : ''}
            <div class="line"></div>

            <div class="double-line"></div>
            <div class="center footer">
                ${data.billId ? `Bill #${data.billId}<br>` : ''}
                Thank you for your stay!<br>
                Generated: ${new Date().toLocaleString('en-US')}<br>
                This is a computer-generated invoice.
            </div>
            <script>window.print();</script>
        </body></html>
    `)
    w.document.close()
}

export type PrintRestaurantBillData = {
  tableNumber: number | string;
  billId?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  foodCharges: number;
  discount: number;
  gstAmount: number;
  gstPercent: number;
  totalAmount: number;
  paymentMode: string;
};

export function printRestaurantBill(data: PrintRestaurantBillData) {
  const content = `
    <html>
      <head>
        <title>Restaurant Bill - Table ${data.tableNumber}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; font-size: 14px; color: #000; max-width: 400px; margin: 0 auto; padding: 20px; line-height: 1.4; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          .header h1 { font-size: 20px; margin: 0 0 5px 0; text-transform: uppercase; }
          .header p { margin: 0; font-size: 12px; }
          .details { margin-bottom: 20px; display: flex; justify-content: space-between; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { border-bottom: 1px dashed #000; padding: 5px 0; text-align: left; font-size: 12px; }
          td { padding: 5px 0; font-size: 12px; vertical-align: top; }
          .qty-col { width: 40px; text-align: center; }
          .price-col, .total-col { text-align: right; }
          .totals { border-top: 1px dashed #000; padding-top: 10px; margin-bottom: 20px; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; }
          .total-row.grand-total { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 5px 0; margin: 10px 0; }
          .footer { text-align: center; font-size: 12px; border-top: 1px dashed #000; padding-top: 20px; }
          @media print { body { padding: 0; margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RESTAURANT BILL</h1>
          <p>Thank you for dining with us</p>
          ${data.billId ? `<p style="margin-top: 5px; font-weight: bold; font-family: monospace;">Bill #${data.billId}</p>` : ''}
        </div>
        
        <div class="details">
          <div>
            <div><strong>Table:</strong> ${data.tableNumber}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-US')}</div>
          </div>
          <div style="text-align: right;">
            <div><strong>Time:</strong> ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</div>
            <div><strong>Payment:</strong> ${data.paymentMode}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="qty-col">Qty</th>
              <th class="total-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.length > 0 ? data.items.map((item) => `
              <tr>
                <td>${item.name}</td>
                <td class="qty-col">${item.quantity}</td>
                <td class="total-col">$${(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="3" style="text-align: center; font-style: italic; color: #666;">No items found</td>
              </tr>
            `}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal</span>
            <span>$${data.foodCharges.toFixed(2)}</span>
          </div>
          ${data.discount > 0 ? `
            <div class="total-row">
              <span>Discount</span>
              <span>-$${data.discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="total-row">
            <span>VAT (${data.gstPercent.toFixed(1)}%)</span>
            <span>$${data.gstAmount.toFixed(2)}</span>
          </div>
          
          <div class="total-row grand-total">
            <span>GRAND TOTAL</span>
            <span>$${data.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Please visit again!</p>
          <p style="font-size: 10px; margin-top: 10px; color: #666;">Damview Resort</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=600,height=800');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}
