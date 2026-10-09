import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, OrderStatus } from '../types';
import {
  Car,
  Search,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  MessageCircle,
  FileDown,
} from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfGenerator';

export const WorkOrdersView: React.FC = () => {
  const {
    workOrders,
    clients,
    openWorkOrderModal,
    openPaymentModal,
    openInvoiceModal,
    openWhatsAppModal,
    deleteWorkOrder,
    openConfirmModal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [debtOnlyFilter, setDebtOnlyFilter] = useState(false);

  // Dynamic status counters
  const totalCount = workOrders.length;
  const inProgressCount = workOrders.filter((o) => o.status === 'in_progress').length;
  const completedCount = workOrders.filter((o) => o.status === 'completed').length;
  const onHoldCount = workOrders.filter((o) => o.status === 'on_hold').length;

  const filteredOrders = workOrders.filter((order) => {
    const client = clients.find((c) => c.id === order.clientId);
    const clientPhone = client?.phone || '';
    const cleanSearch = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !cleanSearch ||
      order.vehiclePlate.toLowerCase().includes(cleanSearch) ||
      order.clientName.toLowerCase().includes(cleanSearch) ||
      order.vehicleModel.toLowerCase().includes(cleanSearch) ||
      order.technicalNotes.toLowerCase().includes(cleanSearch) ||
      order.deliveryDate.toLowerCase().includes(cleanSearch) ||
      clientPhone.toLowerCase().includes(cleanSearch) ||
      String(order.totalAmount).includes(cleanSearch) ||
      String(order.balanceDue).includes(cleanSearch);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (debtOnlyFilter && order.balanceDue <= 0) return false;
    return true;
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDebtOnlyFilter(false);
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || debtOnlyFilter;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 text-blue-600" />
            En progreso
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            En espera
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completado
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            <span>Órdenes de Trabajo (Vehículos &amp; Patentes)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Control de órdenes de vehículos, servicios, saldo adeudado y facturación.
          </p>
        </div>

        <button
          onClick={() => openWorkOrderModal(null)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Orden Auto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
            <input
              type="text"
              placeholder="Buscar por patente, modelo, cliente, teléfono u observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/70 focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros de Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 md:pb-0">
            <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Estado:
            </span>

            {/* Todos */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalCount}
              </span>
            </button>

            {/* En progreso */}
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'in_progress'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs ring-2 ring-blue-300'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>En progreso</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'in_progress' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-900'
              }`}>
                {inProgressCount}
              </span>
            </button>

            {/* Completados */}
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs ring-2 ring-emerald-300'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Completados</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'completed' ? 'bg-emerald-800 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {completedCount}
              </span>
            </button>

            {/* En espera */}
            <button
              onClick={() => setStatusFilter('on_hold')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                statusFilter === 'on_hold'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs ring-2 ring-amber-300'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>En espera</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === 'on_hold' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-900'
              }`}>
                {onHoldCount}
              </span>
            </button>
          </div>
        </div>

        {/* Status & Search Feedback Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">
              Mostrando <strong className="text-slate-900">{filteredOrders.length}</strong> de <strong className="text-slate-700">{totalCount}</strong> trabajos de tapicería vehicular
            </span>

            {/* Secondary filter: solo con saldo */}
            <button
              onClick={() => setDebtOnlyFilter(!debtOnlyFilter)}
              className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors border ${
                debtOnlyFilter
                  ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {debtOnlyFilter ? '✓ Solo con Saldo Pendiente' : 'Filtrar con Deuda'}
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <X className="w-3 h-3" />
              <span>Limpiar filtros y búsqueda</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patente &amp; Modelo</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Observaciones del Trabajo</th>
                <th className="py-3 px-4">Fecha Entrega</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-right">Pagos Parciales</th>
                <th className="py-3 px-4 text-right">Saldo Adeudado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 px-4">
                    <div className="max-w-sm mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-slate-800 font-semibold text-xs">
                        No se encontraron órdenes de tapicería vehicular coincidentes
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        {hasActiveFilters
                          ? 'Prueba modificando el término de búsqueda o cambiando el filtro de estado.'
                          : 'Aún no hay órdenes de tapicería de autos registradas.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearAllFilters}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Restablecer búsqueda y filtros</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const client = clients.find((c) => c.id === order.clientId);
                  const hasDebt = order.balanceDue > 0;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded tracking-widest border border-slate-800">
                            {order.vehiclePlate}
                          </span>
                        </div>
                        <div className="font-semibold text-slate-900 mt-1">{order.vehicleModel}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{order.clientName}</div>
                        {client && <div className="text-[11px] text-slate-500">{client.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 line-clamp-2 text-xs">{order.technicalNotes}</p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.deliveryDate}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block">{getStatusBadge(order.status)}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        ${order.totalAmount.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-emerald-700">
                        ${order.paidAmount.toLocaleString('es-AR')}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {hasDebt ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            ${order.balanceDue.toLocaleString('es-AR')}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Cancelado ($0)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Mensaje WhatsApp Automático */}
                          <button
                            onClick={() =>
                              openWhatsAppModal({
                                clientPhone: client?.phone || '',
                                clientName: order.clientName,
                                itemDescription: `Vehículo ${order.vehiclePlate} (${order.vehicleModel})`,
                                statusText:
                                  order.status === 'completed'
                                    ? 'Completado'
                                    : order.status === 'in_progress'
                                    ? 'En progreso'
                                    : 'En espera',
                                totalAmount: order.totalAmount,
                                paidAmount: order.paidAmount,
                                balanceDue: order.balanceDue,
                                deliveryDate: order.deliveryDate,
                                notes: order.technicalNotes,
                                invoiceNumber: `FAC-0001-${String(order.id.replace(/\D/g, '') || '0482').padStart(6, '0')}`,
                                defaultTemplate:
                                  order.status === 'completed'
                                    ? 'ready'
                                    : order.balanceDue > 0 && order.paidAmount > 0
                                    ? 'debt_reminder'
                                    : 'in_progress',
                              })
                            }
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                            title="Enviar mensaje automático por WhatsApp al cliente"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Factura en Modal */}
                          <button
                            onClick={() => openInvoiceModal(order)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                            title="Ver y Emitir Factura"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Descargar Factura PDF directa */}
                          <button
                            onClick={() => downloadInvoicePDF(order, client)}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded transition-colors"
                            title="Descargar Factura PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Cobrar Abono */}
                          {hasDebt && (
                            <button
                              onClick={() =>
                                openPaymentModal({
                                  id: order.id,
                                  type: 'vehicle',
                                  balanceDue: order.balanceDue,
                                  clientName: order.clientName,
                                  description: `${order.vehiclePlate} (${order.vehicleModel})`,
                                })
                              }
                              className="px-2 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-2xs"
                              title="Registrar abono o pago"
                            >
                              Cobrar
                            </button>
                          )}

                          {/* Editar */}
                          <button
                            onClick={() => openWorkOrderModal(order)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => {
                              openConfirmModal({
                                title: `¿Eliminar orden vehicular #${order.id}?`,
                                message: `Se eliminará definitivamente la orden de ${order.vehiclePlate} (${order.vehicleModel}) del cliente ${order.clientName}. El saldo y totales se actualizarán automáticamente.`,
                                confirmLabel: 'Sí, Eliminar Orden',
                                danger: true,
                                onConfirm: () => deleteWorkOrder(order.id),
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar orden"
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
