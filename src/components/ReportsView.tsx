import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Receipt,
  Printer,
  Download,
  Car,
  Armchair,
  Users,
  CreditCard,
  AlertCircle,
  FileText,
  FileDown,
  MessageCircle,
} from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

export const ReportsView: React.FC = () => {
  const { clients, workOrders, furnitureOrders, payments, openInvoiceModal, openWhatsAppModal } = useApp();

  const [reportType, setReportType] = useState<'invoice' | 'client' | 'debtors' | 'cashflow'>('invoice');
  const [selectedTargetType, setSelectedTargetType] = useState<'vehicle' | 'furniture'>('vehicle');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(workOrders[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');

  const selectedVehicle = workOrders.find((w) => w.id === selectedOrderId) || workOrders[0];
  const selectedFurniture = furnitureOrders.find((f) => f.id === selectedOrderId) || furnitureOrders[0];
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const debtorClients = clients.filter((c) => (c.totalDebt || 0) > 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,';
    if (reportType === 'debtors') {
      csv += 'Cliente,Telefono,Deuda_Pendiente,Total_Facturado\n';
      debtorClients.forEach((c) => {
        csv += `"${c.fullName}","${c.phone}",${c.totalDebt},${c.totalSpent}\n`;
      });
    } else if (reportType === 'cashflow') {
      csv += 'Fecha,Comprobante,Cliente,Detalle,Monto,Medio,Cajero\n';
      payments.forEach((p) => {
        csv += `"${p.paymentDate}","${p.referenceNumber || ''}","${p.clientName}","${p.itemDescription}",${p.amount},"${p.paymentMethod}","${p.recordedBy}"\n`;
      });
    } else {
      csv += 'Tipo,Detalle,Cliente,Total,Pagado,Saldo\n';
      workOrders.forEach((w) => {
        csv += `"Auto","${w.vehiclePlate} (${w.vehicleModel})","${w.clientName}",${w.totalAmount},${w.paidAmount},${w.balanceDue}\n`;
      });
      furnitureOrders.forEach((f) => {
        csv += `"Mueble","${f.furnitureType}","${f.clientName}",${f.totalAmount},${f.paidAmount},${f.balanceDue}\n`;
      });
    }

    const uri = encodeURI(csv);
    const a = document.createElement('a');
    a.href = uri;
    a.download = `reporte_tapiceria_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header (Hidden on print) */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <span>Centro de Facturación &amp; Reportes en PDF</span>
            </h1>
            <p className="text-xs text-slate-500">
              Generación de facturas oficiales de tapicería, estados de cuenta de clientes y reportes de saldos.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {reportType === 'invoice' && (
              <>
                <button
                  onClick={() => {
                    const order = selectedTargetType === 'vehicle' ? selectedVehicle : selectedFurniture;
                    if (order) {
                      const client = clients.find((c) => c.id === order.clientId);
                      downloadInvoicePDF(order, client);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  title="Descargar archivo PDF oficial"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Descargar Factura PDF</span>
                </button>

                <button
                  onClick={() => {
                    const order = selectedTargetType === 'vehicle' ? selectedVehicle : selectedFurniture;
                    if (order) {
                      const client = clients.find((c) => c.id === order.clientId);
                      const isVehicle = selectedTargetType === 'vehicle';
                      openWhatsAppModal({
                        clientPhone: client?.phone || '',
                        clientName: order.clientName,
                        itemDescription: isVehicle
                          ? `Vehículo ${(order as any).vehiclePlate} (${(order as any).vehicleModel})`
                          : `Mueble ${(order as any).furnitureType}`,
                        totalAmount: order.totalAmount,
                        paidAmount: order.paidAmount,
                        balanceDue: order.balanceDue,
                        deliveryDate: order.deliveryDate,
                        notes: (order as any).technicalNotes || (order as any).observations,
                        invoiceNumber: `FAC-0001-${String(order.id.replace(/\D/g, '') || '0482').padStart(6, '0')}`,
                        defaultTemplate: 'invoice',
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  title="Enviar factura por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Report Selector Strip */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setReportType('invoice')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                reportType === 'invoice' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>1. Factura Oficial en PDF</span>
            </button>

            <button
              onClick={() => setReportType('client')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                reportType === 'client' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2. Estado de Cuenta Cliente</span>
            </button>

            <button
              onClick={() => setReportType('debtors')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                reportType === 'debtors' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3. Cartera de Saldos Morosos</span>
            </button>

            <button
              onClick={() => setReportType('cashflow')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                reportType === 'cashflow' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>4. Balance de Caja &amp; Cobranzas</span>
            </button>
          </div>

          {/* Selectors */}
          {reportType === 'invoice' && (
            <div className="flex items-center gap-2">
              <div className="flex border border-slate-300 rounded overflow-hidden">
                <button
                  onClick={() => setSelectedTargetType('vehicle')}
                  className={`px-2 py-1 text-[11px] font-semibold ${selectedTargetType === 'vehicle' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
                >
                  Autos
                </button>
                <button
                  onClick={() => setSelectedTargetType('furniture')}
                  className={`px-2 py-1 text-[11px] font-semibold ${selectedTargetType === 'furniture' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700'}`}
                >
                  Muebles
                </button>
              </div>

              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium"
              >
                {selectedTargetType === 'vehicle'
                  ? workOrders.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.vehiclePlate} ({w.vehicleModel}) — {w.clientName}
                      </option>
                    ))
                  : furnitureOrders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.furnitureType} — {f.clientName}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {reportType === 'client' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Cliente:</span>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.totalDebt > 0 ? `Debe $${c.totalDebt.toLocaleString('es-AR')}` : 'Al día'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Printable Sheet (Vector A4 Form) */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xl">
              GC
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">GESTIÓN DE CLIENTES</h2>
              <p className="text-xs text-slate-600 font-medium">Sistema Integral de Clientes, Vehículos &amp; Muebles</p>
              <p className="text-[10px] text-slate-500">Av. Libertador 4580 • CABA • Tel: +54 9 11 4000-8800 • CUIT: 30-71458921-9</p>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-block border-2 border-slate-900 px-3 py-1 rounded text-center">
              <span className="text-xs font-black block tracking-wider uppercase">
                {reportType === 'invoice' && 'FACTURA OFICIAL'}
                {reportType === 'client' && 'ESTADO DE CUENTA'}
                {reportType === 'debtors' && 'CARTERA MOROSA'}
                {reportType === 'cashflow' && 'LIBRO DE COBRANZAS'}
              </span>
              <span className="text-[10px] font-mono text-slate-600">N° 0001-000482</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Fecha: {new Date().toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {/* 1. FACTURA OFICIAL */}
        {reportType === 'invoice' && (
          <div className="space-y-6 text-xs">
            {/* Box Cliente & Trabajo */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">CLIENTE</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedTargetType === 'vehicle' ? selectedVehicle?.clientName : selectedFurniture?.clientName}
                </p>
                <p className="text-slate-600 mt-0.5">Condición: Consumidor Final</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">TRABAJO ASOCIADO</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedTargetType === 'vehicle'
                    ? `Vehículo: ${selectedVehicle?.vehiclePlate} (${selectedVehicle?.vehicleModel})`
                    : `Mueble: ${selectedFurniture?.furnitureType}`}
                </p>
                <p className="text-slate-600 mt-0.5">
                  Fecha de Entrega: {selectedTargetType === 'vehicle' ? selectedVehicle?.deliveryDate : selectedFurniture?.deliveryDate}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Descripción &amp; Observaciones del Tapizado</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 px-3">
                    <strong className="text-slate-900 block">
                      {selectedTargetType === 'vehicle'
                        ? `Tapizado Automotriz — Patente [${selectedVehicle?.vehiclePlate}]`
                        : `Tapicería de Mueble — [${selectedFurniture?.furnitureType}]`}
                    </strong>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {selectedTargetType === 'vehicle'
                        ? selectedVehicle?.technicalNotes
                        : selectedFurniture?.observations}
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">1</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ${(selectedTargetType === 'vehicle' ? selectedVehicle?.totalAmount : selectedFurniture?.totalAmount)?.toLocaleString('es-AR')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totales */}
            <div className="flex justify-end">
              <div className="w-72 border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 text-slate-600 font-medium">Monto Presupuestado Total</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ${(selectedTargetType === 'vehicle' ? selectedVehicle?.totalAmount : selectedFurniture?.totalAmount)?.toLocaleString('es-AR')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-700 font-medium">Anticipos / Pagos Realizados</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        -${(selectedTargetType === 'vehicle' ? selectedVehicle?.paidAmount : selectedFurniture?.paidAmount)?.toLocaleString('es-AR')}
                      </td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td className="py-2.5 px-3 font-black text-slate-900 uppercase">Saldo a Cancelar</td>
                      <td className="py-2.5 px-3 text-right font-black text-red-700 text-sm">
                        ${(selectedTargetType === 'vehicle' ? selectedVehicle?.balanceDue : selectedFurniture?.balanceDue)?.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Medios de pago */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
              <p>• Transferencia Bancaria: Banco Galicia • Alias: <strong>TAPICERIA.PRO.GALICIA</strong> • CBU: 0070123400000045892190</p>
            </div>
          </div>
        )}

        {/* 2. ESTADO DE CUENTA CLIENTE */}
        {reportType === 'client' && selectedClient && (
          <div className="space-y-6 text-xs">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">ESTADO DE CUENTA</span>
                <p className="font-bold text-slate-900 text-sm">{selectedClient.fullName}</p>
                <p className="text-slate-600">Teléfono: {selectedClient.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">DEUDA ACTUAL</span>
                <p className="font-black text-red-700 text-lg">${selectedClient.totalDebt.toLocaleString('es-AR')}</p>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Rubro</th>
                  <th className="py-2 px-3">Artículo / Patente</th>
                  <th className="py-2 px-3 text-right">Total</th>
                  <th className="py-2 px-3 text-right">Pagado</th>
                  <th className="py-2 px-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workOrders.filter((w) => w.clientId === selectedClient.id).map((w) => (
                  <tr key={w.id}>
                    <td className="py-2 px-3 font-semibold text-blue-700">Auto</td>
                    <td className="py-2 px-3">{w.vehiclePlate} ({w.vehicleModel})</td>
                    <td className="py-2 px-3 text-right font-medium">${w.totalAmount.toLocaleString('es-AR')}</td>
                    <td className="py-2 px-3 text-right text-emerald-700">${w.paidAmount.toLocaleString('es-AR')}</td>
                    <td className="py-2 px-3 text-right font-bold text-red-700">${w.balanceDue.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
                {furnitureOrders.filter((f) => f.clientId === selectedClient.id).map((f) => (
                  <tr key={f.id}>
                    <td className="py-2 px-3 font-semibold text-amber-800">Mueble</td>
                    <td className="py-2 px-3">{f.furnitureType}</td>
                    <td className="py-2 px-3 text-right font-medium">${f.totalAmount.toLocaleString('es-AR')}</td>
                    <td className="py-2 px-3 text-right text-emerald-700">${f.paidAmount.toLocaleString('es-AR')}</td>
                    <td className="py-2 px-3 text-right font-bold text-red-700">${f.balanceDue.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. DEUDORES */}
        {reportType === 'debtors' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Teléfono</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                  <th className="py-2.5 px-3 text-right">Saldo Adeudado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {debtorClients.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{c.fullName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.phone}</td>
                    <td className="py-2.5 px-3 text-right">${c.totalSpent.toLocaleString('es-AR')}</td>
                    <td className="py-2.5 px-3 text-right font-black text-red-700">${c.totalDebt.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. CASHFLOW */}
        {reportType === 'cashflow' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Recibo</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Detalle</th>
                  <th className="py-2.5 px-3">Medio</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3">{p.paymentDate}</td>
                    <td className="py-2 px-3">{p.referenceNumber || `#${p.id}`}</td>
                    <td className="py-2 px-3 font-semibold">{p.clientName}</td>
                    <td className="py-2 px-3">{p.itemDescription}</td>
                    <td className="py-2 px-3 capitalize">{p.paymentMethod}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">${p.amount.toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-10 text-center text-[10px] text-slate-500">
          <div className="border-t border-slate-300 pt-1.5">
            <p className="font-bold text-slate-700 text-xs">Firma Responsable / Taller</p>
            <p>Gestión de Clientes v2</p>
          </div>
          <div className="border-t border-slate-300 pt-1.5">
            <p className="font-bold text-slate-700 text-xs">Firma y Conformidad del Cliente</p>
            <p>Recepción conforme</p>
          </div>
        </div>
      </div>
    </div>
  );
};
