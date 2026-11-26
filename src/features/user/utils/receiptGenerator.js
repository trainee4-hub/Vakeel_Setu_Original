/**
 * Receipt / Tax Invoice helpers (A4 PDF, Goibibo-style layout for Web).
 * Adapted from Vakeel Setu Mobile App Specification for React / Vite Web Client.
 *
 *  - buildReceiptData  : verified booking -> invoice data
 *  - buildReceiptHtml  : the A4 invoice layout
 *  - printReceiptWeb   : opens browser print dialog configured for A4 PDF saving
 *  - downloadReceiptHtml : downloads the standalone self-contained invoice HTML
 */

// ---- COMPANY INVOICE PROFILE ----
// TODO(business): fill these in once registered. Empty values are NOT printed (nothing is invented).
export const INVOICE_PROFILE = {
  brandName: 'Vakeel Setu',
  legalName: 'Vakeel Setu',
  address: 'D-60, D Block, Sector 63, Noida, Uttar Pradesh, 201309',
  email: 'info@vakeelsetu.in',
  phone: '+91 9718494494',
  website: 'Vakeelsetu.in',
  gstin: '', // TODO(business): GSTIN
  pan: '', // TODO(business): PAN
  cin: '', // TODO(business): CIN
  sacCode: '', // TODO(business): SAC code for the consultation service
  placeOfSupply: '', // TODO(business): state of supply (the booking has no billing state)
};

// Shown as "Advocate Name" for consultancy calls (no advocate is chosen at booking time).
const CONSULTANCY_ADVOCATE_TEXT = 'Assigned by Vakeel Setu';

const IST_OFFSET_MS = 330 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Booking "mode" / "callType" values -> readable label.
const TYPE_LABELS = {
  VOICE_CALL: 'Voice Call',
  CALL: 'Voice Call',
  AUDIO_CALL: 'Voice Call',
  VIDEO_CALL: 'Video Call',
  VIDEO: 'Video Call',
  IN_PERSON: 'In-Person Consultation',
  OFFLINE: 'In-Person Consultation',
  OFFICE_VISIT: 'In-Person Consultation',
};

function clock(ms) {
  const d = new Date(ms + IST_OFFSET_MS);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  return `${h % 12 === 0 ? 12 : h % 12}:${m < 10 ? `0${m}` : m} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function formatDateIST(iso) {
  if (!iso) return '—';
  const ms = new Date(iso).getTime();
  if (isNaN(ms)) return '—';
  const d = new Date(ms + IST_OFFSET_MS);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatDateTimeIST(iso) {
  if (!iso) return '—';
  const ms = new Date(iso).getTime();
  if (isNaN(ms)) return '—';
  return `${formatDateIST(iso)}, ${clock(ms)}`;
}

export function formatSlotIST(startAt, endAt, durationMinutes) {
  if (!startAt) return '—';
  const s = new Date(startAt).getTime();
  if (isNaN(s)) return '—';
  const e = endAt ? new Date(endAt).getTime() : s + (durationMinutes || 0) * 60000;
  return `${clock(s)} - ${clock(e)}`;
}

export function rupeesText(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

// Invoice money format: "INR 1,228.60" (always two decimals).
export function inr(n) {
  return `INR ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Reads mode (advocate booking) or callType (consultancy), normalises it and maps it to a label.
export function consultationTypeLabel(b) {
  if (!b) return 'Consultation';
  const raw = String(b.mode ?? b.callType ?? b.consultationType ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  return TYPE_LABELS[raw] ?? 'Consultation';
}

const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const na = (s) => (s && s !== '—' && s !== 'undefined' && s !== 'null' ? s : 'Not Available');

const field = (k, v) =>
  `<div class="f"><div class="fk">${esc(k)}</div><div class="fv">${esc(v)}</div></div>`;

// Payment breakup lines. Itemised only when the verified quote is known AND it adds up to the paid total;
// otherwise one honest line, so the invoice never disagrees with the real payment.
function breakupLines(r) {
  const single = [{ label: `${r.consultationType} (incl. applicable taxes & fees)`, amount: r.total }];
  if (r.fee === undefined || !isFinite(Number(r.fee))) return single;

  const lines = [
    { label: `Consultation Charges${r.durationMin ? ` (${r.durationMin} min)` : ''}`, amount: Number(r.fee) },
  ];
  if (r.platformFee !== undefined && isFinite(Number(r.platformFee))) {
    lines.push({ label: 'Platform / Service Fee', amount: Number(r.platformFee) });
  }
  if (r.gst !== undefined && isFinite(Number(r.gst))) {
    lines.push({ label: `GST / Applicable Taxes${r.gstPercent ? ` (${r.gstPercent}%)` : ''}`, amount: Number(r.gst) });
  }
  if (r.discount && r.discount > 0) {
    lines.push({ label: 'Discount', amount: Number(r.discount), neg: true });
  }

  const sum = lines.reduce((s, l) => s + (l.neg ? -l.amount : l.amount), 0);
  const diff = Math.round((r.total - sum) * 100) / 100;
  if (Math.abs(diff) < 0.005) return lines;
  if (Math.abs(diff) < 1) {
    lines.push({ label: 'Rounding adjustment', amount: Math.abs(diff), neg: diff < 0 });
    return lines;
  }
  return single;
}

/**
 * Builds verified ReceiptData from booking object, auth user, and optional pricing breakdown.
 */
export function buildReceiptData(b, user = {}, pricing = null) {
  if (!b) return null;

  const txn = b.payment?.razorpayPaymentId || b.payment?.transactionId || (b.payment?.status === 'PAID' ? `TXN-${b.bookingId || b.id}` : null);
  const isPaid = b.payment?.status === 'PAID' || Boolean(b.payment?.razorpayPaymentId) || b.status === 'COMPLETED' || b.actions?.canViewReceipt;

  if (!txn && !isPaid) return null;

  const adv = b.advocate ?? {};
  const advName = adv.fullName || adv.name || b.advocateName || '';
  const startAt = b.startAt ?? b.slotStart ?? b.slot?.startAt ?? b.scheduledAt ?? null;
  const endAt = b.endAt ?? b.slotEnd ?? b.slot?.endAt ?? null;
  const duration = Number(b.durationMinutes ?? b.duration) || undefined;
  const noSlot = !startAt;
  const isConsultancy = b.bookingType === 'CONSULTANCY' || (!advName && noSlot);

  const total = Number(b.payment?.amount ?? b.price ?? 0);
  const bookingId = b.bookingId || b.id || 'N/A';
  const p = pricing ?? b.pricing ?? null;

  return {
    receiptNo: `RC-${bookingId}`,
    bookingId,
    transactionId: txn || `TXN-${bookingId}`,
    orderRef: b.payment?.razorpayOrderId || undefined,
    paidAt: b.payment?.paidAt ?? b.createdAt ?? null,
    customerName: user.name || user.fullName || b.contact?.name || '—',
    customerEmail: b.contact?.email || user.email || '—',
    customerPhone: b.contact?.phoneNumber || b.contact?.phone || user.phone || user.phoneNumber || '—',
    advocateName: advName || (isConsultancy ? CONSULTANCY_ADVOCATE_TEXT : 'Assigned Advocate'),
    advocateSpecialization: adv.specialization || adv.bestPracticeArea || adv.practiceArea || adv.specialty || undefined,
    advocateRegId: adv.barCouncilId || adv.registrationId || undefined,
    consultationDate: noSlot ? formatDateIST(b.createdAt) : formatDateIST(startAt),
    timeSlot: noSlot ? (duration ? `${duration} minutes` : '—') : formatSlotIST(startAt, endAt, duration),
    noSlot,
    consultationType: consultationTypeLabel(b),
    durationMin: duration,
    ...(p ? { fee: p.fee, gst: p.gst, gstPercent: p.gstPercent, platformFee: p.platformFee, discount: p.discount ?? p.discountAmount } : {}),
    total,
    status: 'SUCCESS',
    method: b.payment?.method || undefined,
  };
}

/**
 * Generates the full HTML markup for A4 Goibibo-style Tax Invoice.
 */
export function buildReceiptHtml(r) {
  const P = INVOICE_PROFILE;
  const generated = formatDateTimeIST(new Date().toISOString());
  const invoiceDate = r.paidAt ? formatDateIST(r.paidAt) : formatDateIST(new Date().toISOString());

  const rows = breakupLines(r)
    .map((l) => `<tr><td>${esc(l.label)}</td><td class="amt${l.neg ? ' neg' : ''}">${l.neg ? '- ' : ''}${esc(inr(l.amount))}</td></tr>`)
    .join('');

  const headMeta = [
    ['Booking ID', r.bookingId],
    ['Invoice Ref.', r.receiptNo],
    ['Invoice Date', invoiceDate],
    ['Document Type', 'Tax Invoice'],
    ['Booking Status', 'Confirmed'],
    ...(P.placeOfSupply ? [['Place of Supply', P.placeOfSupply]] : []),
  ].map(([k, v]) => `<tr><td class="mk">${esc(k)}</td><td class="mv">${esc(v)}</td></tr>`).join('');

  const companyRows = [
    ['Legal Entity', P.legalName], ['Registered Office', P.address],
    ['GSTIN', P.gstin], ['PAN', P.pan], ['CIN', P.cin], ['HSN / SAC', P.sacCode],
    ['Service Description', 'Legal consultation booking'],
    ['Support Email', P.email], ['Phone', P.phone], ['Website', P.website],
  ].filter(([, v]) => !!v).map(([k, v]) => `<div class="cl"><b>${esc(k)}:</b> ${esc(v)}</div>`);

  const companyGrid = Array.from({ length: Math.ceil(companyRows.length / 2) }, (_, i) =>
    `<tr><td>${companyRows[i * 2]}</td><td>${companyRows[i * 2 + 1] ?? ''}</td></tr>`).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VakeelSetu_Invoice_${esc(r.bookingId)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1a1a1a;
      font-size: 11px;
      line-height: 1.4;
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }
    .page {
      padding: 24px 28px 16px;
      background: #fff;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    /* header */
    .hdr td {
      vertical-align: top;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #111;
      margin-bottom: 6px;
    }
    .meta td {
      padding: 1px 0;
      font-size: 10.5px;
      line-height: 1.35;
    }
    .mk {
      color: #6b6b6b;
      width: 100px;
    }
    .mv {
      font-weight: 700;
      color: #111;
      word-break: break-all;
    }
    .brandbox {
      text-align: right;
    }
    .mark {
      display: inline-block;
      width: 38px;
      height: 38px;
      border-radius: 19px;
      border: 2px solid #D4AF37;
      color: #9a7a14;
      font-weight: 800;
      font-size: 15px;
      line-height: 34px;
      text-align: center;
      background: #fdfbf7;
    }
    .brand {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.8px;
      margin-top: 4px;
      color: #111;
    }
    .brand b {
      color: #B8941F;
    }
    .tag {
      font-size: 10px;
      color: #777;
      margin-top: 2px;
    }
    .rule {
      height: 2px;
      background: linear-gradient(90deg, #D4AF37, #f3e5ab, #D4AF37);
      margin: 12px 0 10px;
    }
    /* sections */
    .sec {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #111;
      margin: 12px 0 6px;
      padding-bottom: 4px;
      border-bottom: 1.5px solid #e2e8f0;
      text-transform: uppercase;
    }
    .grid {
      width: 100%;
    }
    .grid td {
      width: 50%;
      vertical-align: top;
      padding: 2px 0 5px 0;
    }
    .f {
      padding-right: 12px;
    }
    .fk {
      color: #64748b;
      font-size: 9.5px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .fv {
      font-weight: 700;
      color: #0f172a;
      font-size: 11.5px;
      word-wrap: break-word;
      overflow-wrap: anywhere;
      margin-top: 1px;
    }
    /* payment card */
    .card {
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 10px;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .card .ch {
      background: #f8fafc;
      padding: 7px 14px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1.2px;
      border-bottom: 1px solid #cbd5e1;
      color: #334155;
    }
    .pay th {
      font-size: 10px;
      color: #64748b;
      text-align: left;
      font-weight: 700;
      padding: 6px 14px;
      border-bottom: 1px solid #e2e8f0;
      text-transform: uppercase;
      background: #fafafa;
    }
    .pay th.amt, .pay td.amt {
      text-align: right;
      white-space: nowrap;
    }
    .pay td {
      padding: 6px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 11px;
      color: #1e293b;
    }
    .neg {
      color: #dc2626;
      font-weight: 700;
    }
    .tot td {
      font-weight: 800;
      font-size: 12px;
      border-top: 1.5px solid #cbd5e1;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .grand td {
      font-weight: 800;
      font-size: 14px;
      background: #0f172a;
      color: #facc15;
      border: none;
      padding: 9px 14px;
    }
    .paid {
      padding: 8px 14px 4px;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
    }
    .paid .grid td {
      padding-bottom: 6px;
    }
    .ok {
      display: inline-block;
      background: #dcfce7;
      color: #15803d;
      font-weight: 800;
      border-radius: 9999px;
      padding: 2px 10px;
      font-size: 10.5px;
      border: 1px solid #bbf7d0;
    }
    .cf {
      padding: 7px 14px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 9.5px;
      font-style: italic;
    }
    /* notes + company */
    .notes {
      color: #64748b;
      font-size: 9px;
      line-height: 1.5;
      margin: 8px 0 0;
      padding-left: 16px;
    }
    .notes li {
      margin-bottom: 2px;
    }
    .co {
      margin-top: 10px;
      page-break-inside: avoid;
    }
    .cl {
      font-size: 9.5px;
      color: #334155;
      line-height: 1.4;
      padding-right: 10px;
      word-wrap: break-word;
      overflow-wrap: anywhere;
    }
    .cl b {
      color: #64748b;
      font-weight: 600;
    }
    .gen {
      color: #94a3b8;
      font-size: 8.5px;
      text-align: center;
      margin-top: 10px;
      border-top: 1px dashed #e2e8f0;
      padding-top: 6px;
    }

    @media print {
      body {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .page {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <table class="hdr">
      <tr>
        <td style="width: 62%;">
          <div class="title">TAX INVOICE</div>
          <table class="meta">${headMeta}</table>
        </td>
        <td class="brandbox">
          <div class="mark">VS</div>
          <div class="brand">VAKEEL<b>SETU</b></div>
          <div class="tag">Legal consultations, simplified</div>
        </td>
      </tr>
    </table>

    <div class="rule"></div>

    <div class="sec">CONSULTATION DETAILS</div>
    <table class="grid">
      <tr>
        <td>${field('Advocate Name', na(r.advocateName))}</td>
        <td>${field('Consultation Type', na(r.consultationType))}</td>
      </tr>
      <tr>
        <td>${field(r.noSlot ? 'Booking Date' : 'Consultation Date', na(r.consultationDate))}</td>
        <td>${field(r.noSlot ? 'Duration' : 'Time Slot', na(r.timeSlot))}</td>
      </tr>
      ${r.advocateSpecialization || r.advocateRegId ? `
      <tr>
        <td>${r.advocateSpecialization ? field('Specialization', r.advocateSpecialization) : ''}</td>
        <td>${r.advocateRegId ? field('Advocate Bar ID', r.advocateRegId) : ''}</td>
      </tr>` : ''}
    </table>

    <div class="sec">CUSTOMER INFORMATION</div>
    <table class="grid">
      <tr>
        <td>${field('Customer Name', na(r.customerName))}</td>
        <td>${field('Phone', na(r.customerPhone))}</td>
      </tr>
      <tr>
        <td colspan="2">${field('Email Address', na(r.customerEmail))}</td>
      </tr>
    </table>

    <div class="card">
      <div class="ch">PAYMENT BREAKUP</div>
      <table class="pay">
        <tr>
          <th>Description</th>
          <th class="amt">Amount (INR)</th>
        </tr>
        ${rows}
        <tr class="tot">
          <td>Total Booking Amount</td>
          <td class="amt">${esc(inr(r.total))}</td>
        </tr>
        <tr class="grand">
          <td>GRAND TOTAL</td>
          <td class="amt">${esc(inr(r.total))}</td>
        </tr>
      </table>
      <div class="paid">
        <table class="grid">
          <tr>
            <td>${field('Amount Paid', inr(r.total))}</td>
            <td>
              <div class="f">
                <div class="fk">Payment Status</div>
                <div class="fv"><span class="ok">${esc(r.status === 'SUCCESS' ? 'PAID' : r.status)}</span></div>
              </div>
            </td>
          </tr>
          <tr>
            <td>${field('Payment Transaction ID', r.transactionId)}</td>
            <td>${field('Payment Date', na(formatDateTimeIST(r.paidAt)))}</td>
          </tr>
          <tr>
            <td>${r.method ? field('Payment Method', r.method) : ''}</td>
            <td>${r.orderRef ? field('Order Reference', r.orderRef) : ''}</td>
          </tr>
        </table>
      </div>
      <div class="cf">This is a computer-generated invoice and does not require a physical signature or stamp.</div>
    </div>

    <ul class="notes">
      <li>This invoice represents the consultation booked through ${esc(P.brandName)}.</li>
      <li>This document is a payment / invoice record and is not a legal document or legal advice.</li>
    </ul>

    <div class="co">
      <div class="sec" style="margin-top: 10px;">COMPANY INFORMATION</div>
      <table class="grid">${companyGrid}</table>
    </div>

    <div class="gen">Generated on ${esc(generated)} · ${esc(P.brandName)}</div>
  </div>
</body>
</html>`;
}

/**
 * Triggers clean browser print dialog with the exact A4 layout.
 * Browser users can print or select "Save as PDF" to get the exact PDF invoice.
 */
export function printReceiptWeb(receiptData) {
  const html = buildReceiptHtml(receiptData);
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to print/download invoice.');
    return;
  }
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 350);
}

/**
 * Downloads the receipt as an offline HTML file.
 */
export function downloadReceiptHtml(receiptData) {
  const html = buildReceiptHtml(receiptData);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VakeelSetu_Invoice_${receiptData.bookingId}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

