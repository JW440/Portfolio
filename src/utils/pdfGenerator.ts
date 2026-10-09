import { jsPDF } from 'jspdf';
import { WorkOrder, FurnitureOrder, Client } from '../types';

export function downloadInvoicePDF(
  order: WorkOrder | FurnitureOrder,
  client?: Client | null,
  invoiceType: string = 'Factura B'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isVehicle = 'vehiclePlate' in order;
  const invoiceNumber = `FAC-0001-${String(order.id.replace(/\D/g, '') || '0482').padStart(6, '0')}`;
  const totalAmount = Number(order.totalAmount) || 0;
  const paidAmount = Number(order.paidAmount) || 0;
  const balanceDue = Number(order.balanceDue) || 0;
  const clientName = order.clientName || client?.fullName || 'Cliente General';
  const clientPhone = client?.phone || 'No registrado';
  const clientEmail = client?.email || '';
  const clientAddress = client?.address || '';
  const dateStr = new Date().toLocaleDateString('es-AR');
  const deliveryDateStr = order.deliveryDate || 'A coordinar';

  const notes =
    (isVehicle ? (order as WorkOrder).technicalNotes : (order as FurnitureOrder).observations) ||
    'Servicio general de tapicería';

  // Colors
  const primaryColor = [15, 23, 42]; // slate-900
  const blueColor = [37, 99, 235]; // blue-600
  const grayColor = [100, 116, 139]; // slate-500
  const lightBg = [248, 250, 252]; // slate-50
  const greenColor = [16, 185, 129]; // emerald-500
  const redColor = [220, 38, 38]; // red-600

  // 1. Header
  // Brand box
  doc.setFillColor(15, 23, 42);
  doc.rect(14, 14, 14, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TP', 18, 23);

  // Brand text
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('GESTIÓN DE CLIENTES', 32, 21);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Sistema de Gestión de Clientes • Órdenes, Vehículos y Muebles', 32, 26);
  doc.text('Av. Libertador 4580 • CABA, Argentina • Tel: +54 9 11 4000-8800', 32, 30);
  doc.text('CUIT: 30-71458921-9 • IVA Responsable Inscripto', 32, 34);

  // Invoice Type Badge / Box
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.6);
  doc.rect(150, 14, 46, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(invoiceType.toUpperCase(), 173, 21, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(invoiceNumber, 173, 26, { align: 'center' });
  doc.text(`Fecha: ${dateStr}`, 173, 31, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, 40, 196, 40);

  // 2. Client & Service boxes
  // Client Info Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(14, 44, 88, 30, 'F');
  doc.rect(14, 44, 88, 30, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('DATOS DEL CLIENTE', 18, 50);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(clientName.length > 32 ? clientName.slice(0, 32) + '...' : clientName, 18, 56);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Tel / WhatsApp: ${clientPhone}`, 18, 62);
  if (clientEmail) {
    doc.text(`Email: ${clientEmail}`, 18, 67);
  } else if (clientAddress) {
    doc.text(`Domicilio: ${clientAddress}`, 18, 67);
  }

  // Service Reference Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(108, 44, 88, 30, 'F');
  doc.rect(108, 44, 88, 30, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('REFERENCIA DEL TRABAJO', 112, 50);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  if (isVehicle) {
    const vOrder = order as WorkOrder;
    doc.text(`Patente: ${vOrder.vehiclePlate} (${vOrder.vehicleModel})`, 112, 56);
  } else {
    const fOrder = order as FurnitureOrder;
    doc.text(`Mueble: ${fOrder.furnitureType}`, 112, 56);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`Fecha estimada de entrega: ${deliveryDateStr}`, 112, 62);
  doc.text(
    `Tipo de trabajo: ${isVehicle ? 'Tapicería Automotriz' : 'Tapicería de Mueble / Hogar'}`,
    112,
    67
  );

  // 3. Items Table Header
  const tableTop = 80;
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableTop, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESCRIPCIÓN Y OBSERVACIONES TÉCNICAS', 18, tableTop + 5.5);
  doc.text('CANT.', 145, tableTop + 5.5, { align: 'center' });
  doc.text('TOTAL', 190, tableTop + 5.5, { align: 'right' });

  // Table Body Row
  const rowTop = tableTop + 8;
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, rowTop, 182, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const itemTitle = isVehicle
    ? `Servicio de Tapicería Vehicular — ${(order as WorkOrder).vehiclePlate}`
    : `Tapicería y Restauración de ${(order as FurnitureOrder).furnitureType}`;
  doc.text(itemTitle, 18, rowTop + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  const splitNotes = doc.splitTextToSize(`Observaciones: ${notes}`, 120);
  doc.text(splitNotes, 18, rowTop + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1', 145, rowTop + 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalAmount.toLocaleString('es-AR')}`, 190, rowTop + 7, { align: 'right' });

  // 4. Financial Breakdown Table
  const totalsTop = rowTop + 42;
  const totalsLeft = 118;
  const totalsWidth = 78;

  doc.rect(totalsLeft, totalsTop, totalsWidth, 26);

  // Line 1: Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Subtotal Presupuestado:', totalsLeft + 4, totalsTop + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`$${totalAmount.toLocaleString('es-AR')}`, totalsLeft + totalsWidth - 4, totalsTop + 6, {
    align: 'right',
  });

  // Line 2: Anticipos / Pagos
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Anticipos / Pagos Realizados:', totalsLeft + 4, totalsTop + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  doc.text(`-$${paidAmount.toLocaleString('es-AR')}`, totalsLeft + totalsWidth - 4, totalsTop + 13, {
    align: 'right',
  });

  // Line 3: Saldo a Pagar
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(totalsLeft, totalsTop + 16, totalsWidth, 10, 'F');
  doc.rect(totalsLeft, totalsTop + 16, totalsWidth, 10, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SALDO A PAGAR:', totalsLeft + 4, totalsTop + 22.5);

  doc.setFontSize(9.5);
  if (balanceDue > 0) {
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.text(`$${balanceDue.toLocaleString('es-AR')}`, totalsLeft + totalsWidth - 4, totalsTop + 22.5, {
      align: 'right',
    });
  } else {
    doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
    doc.text('CANCELADO ($0)', totalsLeft + totalsWidth - 4, totalsTop + 22.5, { align: 'right' });
  }

  // Payment methods box on the left
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(14, totalsTop, 98, 26, 'F');
  doc.rect(14, totalsTop, 98, 26, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('MEDIOS DE PAGO HABILITADOS:', 18, totalsTop + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('• Transferencia Bancaria: Banco Galicia', 18, totalsTop + 12);
  doc.text('• Alias: GESTION.CLIENTES.PAGOS | CBU: 0070123400000045892190', 18, totalsTop + 17);
  doc.text('• Efectivo o Débito al momento de retirar el trabajo en taller.', 18, totalsTop + 22);

  // 5. Signatures
  const signaturesTop = totalsTop + 36;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);

  // Signature 1
  doc.line(24, signaturesTop, 84, signaturesTop);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Firma Responsable / Taller', 54, signaturesTop + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Gestión de Clientes v2', 54, signaturesTop + 8.5, { align: 'center' });

  // Signature 2
  doc.line(126, signaturesTop, 186, signaturesTop);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Firma y Conformidad del Cliente', 156, signaturesTop + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text('Recepción conforme de trabajo y saldo', 156, signaturesTop + 8.5, { align: 'center' });

  // 6. Footer note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento emitido electrónicamente por el sistema Gestión de Clientes • ID: ${order.id} • ${new Date().toISOString()}`,
    105,
    286,
    { align: 'center' }
  );

  // Trigger download
  const cleanClient = clientName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Factura_${invoiceNumber}_${cleanClient}.pdf`;
  doc.save(fileName);
}
