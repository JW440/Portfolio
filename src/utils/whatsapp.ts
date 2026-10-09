export function cleanPhoneNumber(phone: string): string {
  // Remove non-digit characters except leading +
  let cleaned = phone.replace(/[^\d]/g, '');

  // If local Argentine number like 1145892310 or 15..., ensure international code 549
  if (cleaned.startsWith('54') && !cleaned.startsWith('549') && cleaned.length >= 12) {
    cleaned = '549' + cleaned.slice(2);
  } else if (!cleaned.startsWith('54') && cleaned.length === 10) {
    // Standard 10-digit Argentine area + number
    cleaned = '549' + cleaned;
  }

  return cleaned;
}

export function buildWhatsAppUrl(phone: string, text: string): string {
  const cleaned = cleanPhoneNumber(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export interface WhatsAppTemplateOptions {
  clientName: string;
  itemDescription: string;
  statusText?: string;
  totalAmount?: number;
  paidAmount?: number;
  balanceDue?: number;
  deliveryDate?: string;
  notes?: string;
  invoiceNumber?: string;
}

export function generateWhatsAppMessage(
  type: 'ready' | 'in_progress' | 'debt_reminder' | 'invoice' | 'custom',
  data: WhatsAppTemplateOptions
): string {
  const name = data.clientName.trim() || 'Cliente';
  const item = data.itemDescription.trim() || 'su trabajo de tapicería';
  const balanceStr =
    (data.balanceDue ?? 0) > 0 ? `$${(data.balanceDue ?? 0).toLocaleString('es-AR')}` : '$0 (Cancelado)';
  const totalStr = `$${(data.totalAmount ?? 0).toLocaleString('es-AR')}`;
  const dateStr = data.deliveryDate || 'A coordinar';

  switch (type) {
    case 'ready':
      return `¡Hola ${name}! 👋 Te escribimos desde *Gestión de Clientes*.\n\n` +
        `Nos complace informarte que tu trabajo (*${item}*) ya está *TERMINADO Y LISTO PARA RETIRAR* en nuestras instalaciones. ✨\n\n` +
        `💰 *Saldo pendiente a cancelar:* ${balanceStr}\n` +
        `📍 *Dirección de retiro:* Av. Libertador 4580, CABA\n` +
        `🕒 *Horario:* Lunes a Viernes de 8:30 a 18:30 hs.\n\n` +
        `¡Te esperamos! Muchas gracias por confiar en nuestro trabajo.`;

    case 'in_progress':
      return `¡Hola ${name}! 👋 Te saludamos desde *Gestión de Clientes*.\n\n` +
        `Te confirmamos que ya dimos inicio a los trabajos correspondientes a (*${item}*). 🛠️📋\n\n` +
        `📅 *Fecha estimada de entrega:* ${dateStr}\n` +
        (data.notes ? `📝 *Observaciones:* ${data.notes}\n\n` : '\n') +
        `Cualquier consulta o detalle adicional estamos a tu entera disposición. ¡Saludos!`;

    case 'debt_reminder':
      return `¡Hola ${name}! 👋 Te contactamos desde la administración de *Gestión de Clientes*.\n\n` +
        `Te enviamos un recordatorio del saldo pendiente correspondiente a (*${item}*):\n\n` +
        `💰 *Monto Adeudado:* ${balanceStr}\n` +
        `💳 *Medio de pago sugerido (Transferencia Bancaria):*\n` +
        `• Banco Galicia\n` +
        `• Alias: *GESTION.CLIENTES.PAGOS*\n` +
        `• CBU: 0070123400000045892190\n\n` +
        `Una vez realizado el comprobante podés enviárnoslo por este medio. ¡Muchas gracias!`;

    case 'invoice':
      return `¡Hola ${name}! 👋 Te adjuntamos la información de tu comprobante en *Gestión de Clientes*.\n\n` +
        `📄 *Comprobante N°:* ${data.invoiceNumber || 'Oficial'}\n` +
        `🛠️ *Detalle del Servicio:* ${item}\n` +
        `💵 *Monto Total Presupuestado:* ${totalStr}\n` +
        `💰 *Saldo Restante a Cancelar:* ${balanceStr}\n\n` +
        `Podés solicitar tu factura en PDF directamente con nosotros. ¡Gracias por elegirnos!`;

    default:
      return `¡Hola ${name}! Te escribimos desde *Gestión de Clientes* en relación a tu orden (*${item}*). ¿Cómo podemos ayudarte?`;
  }
}
