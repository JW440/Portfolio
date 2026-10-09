import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Printer, Download, Receipt, Building2, CheckCircle2, MessageCircle, FileDown } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

export const InvoiceModal: React.FC = () => {
  const { modalState, closeInvoiceModal, clients, openWhatsAppModal } = useApp();
  const { invoiceModalOpen, invoiceData } = modalState;

  const [invoiceType, setInvoiceType] = useState<'Factura B' | 'Comprobante Oficial' | 'Presupuesto'>('Factura B');
  const [includeVat, setIncludeVat] = useState(false);

  if (!invoiceModalOpen || !invoiceData) return null;

  const client = clients.find((c) => c.id === invoiceData.clientId);
  const isVehicle = 'vehiclePlate' in invoiceData;

  const invoiceNumber = `FAC-0001-${String(invoiceData.id.replace(/\D/g, '') || '0482').padStart(6, '0')}`;
  const totalAmount = Number(invoiceData.totalAmount) || 0;
  const paidAmount = Number(invoiceData.paidAmount) || 0;
  const balanceDue = Number(invoiceData.balanceDue) || 0;

  const subtotal = includeVat ? totalAmount / 1.21 : totalAmount;
  const vat = includeVat ? totalAmount - subtotal : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadInvoicePDF(invoiceData, client, invoiceType);
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppModal({
      clientPhone: client?.phone || '',
      clientName: invoiceData.clientName,
      itemDescription: isVehicle
        ? `Vehículo ${invoiceData.vehiclePlate} (${invoiceData.vehicleModel})`
        : `Mueble ${invoiceData.furnitureType}`,
      totalAmount,
      paidAmount,
      balanceDue,
      deliveryDate: invoiceData.deliveryDate,
      notes: invoiceData.technicalNotes || invoiceData.observations,
      invoiceNumber,
      defaultTemplate: 'invoice',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden my-6">
        {/* Top Control Bar (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50 print:hidden gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">Emisión de Factura en PDF</h3>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.2 rounded font-semibold">
              {invoiceNumber}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 font-medium"
            >
              <option value="Factura B">Factura B (Consumidor Final)</option>
              <option value="Comprobante Oficial">Comprobante de Tapicería</option>
              <option value="Presupuesto">Presupuesto Formal</option>
            </select>

            {/* Direct PDF Download button */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
              title="Descargar archivo PDF al dispositivo"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Descargar Factura PDF</span>
            </button>

            {/* WhatsApp notification button */}
            <button
              onClick={handleOpenWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              title="Enviar factura y detalle por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button onClick={closeInvoiceModal} className="p-1 rounded text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Invoice Paper Document (Clean A4 layout with print styles) */}
        <div className="p-8 sm:p-12 text-xs text-slate-800 space-y-6 max-h-[75vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xl">
                GC
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">GESTIÓN DE CLIENTES</h2>
                <p className="text-[11px] text-slate-600 font-medium">Sistema Integral de Clientes, Vehículos &amp; Muebles</p>
                <p className="text-[10px] text-slate-500">Av. Libertador 4580 • CABA, Argentina • Tel: +54 9 11 4000-8800</p>
                <p className="text-[10px] text-slate-500">CUIT: 30-71458921-9 • IVA Responsable Inscripto</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-2 border-slate-900 px-3 py-1 rounded text-center">
                <span className="text-sm font-black block tracking-widest">{invoiceType.toUpperCase()}</span>
                <span className="text-[9px] text-slate-500 font-mono">N° 0001-000482</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-2 font-medium">
                Fecha: {new Date().toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>

          {/* Client Details Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">DATOS DEL CLIENTE</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{invoiceData.clientName}</p>
              <p className="text-slate-600 text-xs mt-0.5">Teléfono: {client?.phone || 'No especificado'}</p>
              {client?.email && <p className="text-slate-500 text-[11px]">Email: {client.email}</p>}
            </div>

            <div className="text-right sm:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">REFERENCIA DEL SERVICIO</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {isVehicle ? `Vehículo: ${invoiceData.vehiclePlate}` : `Mueble: ${invoiceData.furnitureType}`}
              </p>
              <p className="text-slate-600 text-xs mt-0.5">
                {isVehicle ? `Modelo: ${invoiceData.vehicleModel}` : `Artículo de Tapicería`}
              </p>
              <p className="text-slate-500 text-[11px]">
                Fecha de Entrega: {invoiceData.deliveryDate || 'A coordinar'}
              </p>
            </div>
          </div>

          {/* Items / Detalle Table */}
          <div>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Descripción / Observaciones del Trabajo</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3 text-right">Precio Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">
                    <strong className="text-slate-900 block text-xs">
                      {isVehicle
                        ? `Servicio de Tapicería Automotriz — Patente [${invoiceData.vehiclePlate}]`
                        : `Trabajo de Tapicería de Mueble — [${invoiceData.furnitureType}]`}
                    </strong>
                    <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                      {invoiceData.technicalNotes || invoiceData.observations || 'Sin observaciones adicionales.'}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">1</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ${totalAmount.toLocaleString('es-AR')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-72 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 text-slate-600 font-medium">Subtotal Presupuestado</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      ${totalAmount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-emerald-700 font-medium">Anticipos / Pagos Realizados</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      -${paidAmount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                  <tr className="bg-slate-100">
                    <td className="py-2.5 px-3 font-black text-slate-900 uppercase">Saldo a Pagar</td>
                    <td className="py-2.5 px-3 text-right font-black text-red-700 text-sm">
                      ${balanceDue.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bank Transfer & Terms */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
            <strong className="text-slate-800 block text-xs">Medios de Pago Habilitados:</strong>
            <p>• Transferencia Bancaria: Banco Galicia • Alias: <strong>GESTION.CLIENTES.PAGOS</strong> • CBU: 0070123400000045892190</p>
            <p>• Efectivo o Tarjetas de Débito/Crédito al momento de retirar el trabajo en taller.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 pt-10 text-center text-[10px] text-slate-500">
            <div className="border-t border-slate-300 pt-1.5">
              <p className="font-bold text-slate-700 text-xs">Firma Responsable / Taller</p>
              <p>Gestión de Clientes v2</p>
            </div>
            <div className="border-t border-slate-300 pt-1.5">
              <p className="font-bold text-slate-700 text-xs">Firma y Conformidad del Cliente</p>
              <p>Recepción conforme de trabajo y saldo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
