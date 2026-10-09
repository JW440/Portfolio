import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Payment } from '../types';
import {
  CreditCard,
  Search,
  Plus,
  FileText,
  Trash2,
  Receipt,
  UserCheck,
} from 'lucide-react';

export const PaymentsView: React.FC = () => {
  const { payments, workOrders, furnitureOrders, openPaymentModal, openInvoiceModal, deletePayment, openConfirmModal } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.itemDescription && payment.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.referenceNumber && payment.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (methodFilter !== 'all' && payment.paymentMethod !== methodFilter) return false;
    if (dateFilter && payment.paymentDate !== dateFilter) return false;

    return true;
  });

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'transfer':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Transferencia</span>;
      case 'cash':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Efectivo</span>;
      case 'card':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">Tarjeta Débito/Crédito</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">Otro / Cheque</span>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <span>Terminal de Cobranzas y Registro de Pagos Parciales</span>
          </h1>
          <p className="text-xs text-slate-500">
            Libro de ingresos, conciliación de abonos contra tapicería de autos y muebles.
          </p>
        </div>

        <button
          onClick={() => openPaymentModal(null)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cobro / Abono</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Recaudado</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            ${totalCollected.toLocaleString('es-AR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{payments.length} recibos asentados</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cobrado por Transferencia</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            $
            {payments
              .filter((p) => p.paymentMethod === 'transfer')
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString('es-AR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Bancos &amp; Cuentas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cobrado en Efectivo</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            $
            {payments
              .filter((p) => p.paymentMethod === 'cash')
              .reduce((s, p) => s + p.amount, 0)
              .toLocaleString('es-AR')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Caja taller</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, detalle o comprobante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Medio:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700"
            >
              <option value="all">Todos los medios</option>
              <option value="transfer">Transferencia</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Fecha:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
            />
            {dateFilter && (
              <button onClick={() => setDateFilter('')} className="text-blue-600 hover:underline font-medium">
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Fecha &amp; Comprobante</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Artículo / Trabajo Imputado</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Monto Cobrado</th>
                <th className="py-3 px-4">Registrado Por</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    No hay pagos registrados coincidentes.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const associatedVehicle = workOrders.find((w) => w.id === payment.orderId);
                  const associatedFurniture = furnitureOrders.find((f) => f.id === payment.orderId);
                  const targetOrder = associatedVehicle || associatedFurniture;

                  return (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{payment.paymentDate}</div>
                        <div className="text-[11px] text-slate-400">
                          {payment.referenceNumber ? `Comp: ${payment.referenceNumber}` : `ID #${payment.id}`}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{payment.clientName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${payment.orderType === 'vehicle' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                            {payment.orderType === 'vehicle' ? 'Auto' : 'Mueble'}
                          </span>
                          <span>{payment.itemDescription}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getMethodBadge(payment.paymentMethod)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-bold text-emerald-700">
                          ${payment.amount.toLocaleString('es-AR')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{payment.recordedBy}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {targetOrder && (
                            <button
                              onClick={() => openInvoiceModal(targetOrder)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Ver Factura en PDF"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              openConfirmModal({
                                title: `¿Anular el pago de $${payment.amount.toLocaleString('es-AR')}?`,
                                message: `Se anulará el cobro y el saldo pendiente de la orden será revertido automáticamente.`,
                                confirmLabel: 'Sí, Anular Pago',
                                danger: true,
                                onConfirm: () => deletePayment(payment.id),
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Anular pago"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
