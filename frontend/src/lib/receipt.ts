export interface ReceiptData {
  bookingId: string
  date: string
  status: string
  driverName: string
  vehicleModel: string
  vehicleNumber: string
  vehicleColor: string
  pickup: string
  drop: string
  amount: number
}

export function downloadReceiptPDF(data: ReceiptData) {
  const html = `
    <html>
    <head>
      <title>Ride Receipt</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        .receipt { max-width: 500px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 24px; text-align: center; color: white; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { font-size: 13px; opacity: 0.85; }
        .body { padding: 24px; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 10px; font-weight: 600; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .row .label { color: #6b7280; }
        .row .value { font-weight: 500; text-align: right; max-width: 60%; }
        .divider { height: 1px; background: #e5e7eb; margin: 16px 0; }
        .total { display: flex; justify-content: space-between; padding: 16px; background: #f9fafb; border-radius: 8px; margin-top: 8px; }
        .total .label { font-size: 16px; font-weight: 600; }
        .total .value { font-size: 20px; font-weight: 700; color: #3b82f6; }
        .footer { text-align: center; padding: 16px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d1fae5; color: #065f46; }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>CheckPoint</h1>
          <p>Ride Receipt</p>
        </div>
        <div class="body">
          <div class="section">
            <div class="row">
              <span class="label">Booking ID</span>
              <span class="value">#${data.bookingId}</span>
            </div>
            <div class="row">
              <span class="label">Date</span>
              <span class="value">${data.date}</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="value"><span class="status">${data.status}</span></span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="section">
            <div class="section-title">Driver</div>
            <div class="row">
              <span class="label">Name</span>
              <span class="value">${data.driverName}</span>
            </div>
            <div class="row">
              <span class="label">Vehicle</span>
              <span class="value">${data.vehicleModel}</span>
            </div>
            <div class="row">
              <span class="label">Number</span>
              <span class="value">${data.vehicleNumber}</span>
            </div>
            <div class="row">
              <span class="label">Color</span>
              <span class="value">${data.vehicleColor}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="section">
            <div class="section-title">Route</div>
            <div class="row">
              <span class="label">Pickup</span>
              <span class="value">${data.pickup}</span>
            </div>
            <div class="row">
              <span class="label">Drop</span>
              <span class="value">${data.drop}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="total">
            <span class="label">Total Paid</span>
            <span class="value">₹${data.amount}</span>
          </div>
        </div>
        <div class="footer">Thank you for riding with CheckPoint!</div>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
