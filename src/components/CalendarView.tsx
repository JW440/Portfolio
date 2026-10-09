import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Car,
  Armchair,
  Clock,
  CheckCircle2,
  FileText,
  CreditCard,
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  MessageCircle,
  FileDown,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { downloadInvoicePDF } from '../utils/pdfGenerator';
import { WorkOrder, FurnitureOrder } from '../types';

export const CalendarView: React.FC = () => {
  const {
    workOrders,
    furnitureOrders,
    clients,
    openWorkOrderModal,
    openFurnitureModal,
    openInvoiceModal,
    openPaymentModal,
    openWhatsAppModal,
    deleteWorkOrder,
    deleteFurnitureOrder,
    openConfirmModal,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 8)); // October 2026
  const [filterType, setFilterType] = useState<'all' | 'vehicle' | 'furniture'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState<{
    order: WorkOrder | FurnitureOrder;
    type: 'vehicle' | 'furniture';
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date(2026, 9, 8));

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Search filter helper
  const matchesSearch = (item: WorkOrder | FurnitureOrder, isVehicle: boolean) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    if (item.clientName?.toLowerCase().includes(q)) return true;
    if (item.deliveryDate?.toLowerCase().includes(q)) return true;
    if (isVehicle) {
      const v = item as WorkOrder;
      if (v.vehiclePlate?.toLowerCase().includes(q)) return true;
      if (v.vehicleModel?.toLowerCase().includes(q)) return true;
      if (v.technicalNotes?.toLowerCase().includes(q)) return true;
    } else {
      const f = item as FurnitureOrder;
      if (f.furnitureType?.toLowerCase().includes(q)) return true;
      if (f.observations?.toLowerCase().includes(q)) return true;
    }
    return false;
  };

  // Global search results across all months
  const globalSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const results: Array<{
      order: WorkOrder | FurnitureOrder;
      type: 'vehicle' | 'furniture';
      title: string;
      subtitle: string;
      date: string;
      balance: number;
    }> = [];

    if (filterType === 'all' || filterType === 'vehicle') {
      workOrders.forEach((w) => {
        if (matchesSearch(w, true)) {
          results.push({
            order: w,
            type: 'vehicle',
            title: `${w.vehiclePlate} (${w.vehicleModel})`,
            subtitle: w.clientName,
            date: w.deliveryDate,
            balance: w.balanceDue,
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'furniture') {
      furnitureOrders.forEach((f) => {
        if (matchesSearch(f, false)) {
          results.push({
            order: f,
            type: 'furniture',
            title: f.furnitureType,
            subtitle: f.clientName,
            date: f.deliveryDate,
            balance: f.balanceDue,
          });
        }
      });
    }

    return results.sort((a, b) => a.date.localeCompare(b.date));
  }, [searchQuery, filterType, workOrders, furnitureOrders]);

  // Combine items by delivery date for the active month
  const getDeliveriesForDate = (dateStr: string) => {
    const list: Array<{
      id: string;
      type: 'vehicle' | 'furniture';
      title: string;
      subtitle: string;
      balance: number;
      status: string;
      raw: WorkOrder | FurnitureOrder;
    }> = [];

    if (filterType === 'all' || filterType === 'vehicle') {
      workOrders.forEach((w) => {
        if (w.deliveryDate === dateStr && matchesSearch(w, true)) {
          list.push({
            id: w.id,
            type: 'vehicle',
            title: `${w.vehiclePlate} (${w.vehicleModel})`,
            subtitle: w.clientName,
            balance: w.balanceDue,
            status: w.status,
            raw: w,
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'furniture') {
      furnitureOrders.forEach((f) => {
        if (f.deliveryDate === dateStr && matchesSearch(f, false)) {
          list.push({
            id: f.id,
            type: 'furniture',
            title: f.furnitureType,
            subtitle: f.clientName,
            balance: f.balanceDue,
            status: f.status,
            raw: f,
          });
        }
      });
    }

    return list;
  };

  const jumpToDate = (dateString: string) => {
    if (!dateString) return;
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const targetYear = parseInt(parts[0], 10);
      const targetMonth = parseInt(parts[1], 10) - 1;
      setCurrentDate(new Date(targetYear, targetMonth, 1));
    }
  };

  const handleDeleteOrder = (order: WorkOrder | FurnitureOrder, type: 'vehicle' | 'furniture') => {
    const label =
      type === 'vehicle'
        ? `el trabajo vehicular ${(order as WorkOrder).vehiclePlate}`
        : `el mueble ${(order as FurnitureOrder).furnitureType}`;

    openConfirmModal({
      title: `¿Eliminar ${type === 'vehicle' ? 'orden vehicular' : 'orden de mueble'}?`,
      message: `Se eliminará definitivamente ${label} del cliente ${order.clientName} y se actualizarán los saldos.`,
      confirmLabel: 'Sí, Eliminar',
      danger: true,
      onConfirm: () => {
        if (type === 'vehicle') {
          deleteWorkOrder(order.id);
        } else {
          deleteFurnitureOrder(order.id);
        }
        setSelectedItemDetail(null);
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Calendar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span>Calendario de Entregas &amp; Órdenes Programadas</span>
          </h1>
          <p className="text-xs text-slate-500">
            Vista cronológica de compromisos de entrega con búsqueda rápida y gestión completa de eliminación y edición.
          </p>
        </div>

        {/* Filter and New Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('vehicle')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                filterType === 'vehicle' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>Autos</span>
            </button>
            <button
              onClick={() => setFilterType('furniture')}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                filterType === 'furniture' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Armchair className="w-3 h-3" />
              <span>Muebles</span>
            </button>
          </div>

          <button
            onClick={() => openWorkOrderModal(null)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Auto</span>
          </button>

          <button
            onClick={() => openFurnitureModal(null)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Mueble</span>
          </button>
        </div>
      </div>

      {/* Month Navigation & Search Bar Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 px-2 min-w-[150px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={today}
            className="px-2.5 py-1 text-xs font-medium border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 transition-colors"
          >
            Hoy
          </button>
        </div>

        {/* Search Bar in Calendar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en el calendario por cliente, patente, mueble o notas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search results banner if search is active */}
      {searchQuery.trim() && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-blue-900">
                Resultados de búsqueda: {globalSearchResults.length} entrega(s) encontrada(s)
              </span>
              <span className="text-[11px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                "{searchQuery}"
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
            >
              Ver mes completo
            </button>
          </div>

          {globalSearchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {globalSearchResults.map((res) => (
                <div
                  key={res.order.id}
                  className="bg-white p-2.5 rounded-lg border border-blue-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        {res.type === 'vehicle' ? (
                          <Car className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <Armchair className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span className="truncate">{res.title}</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{res.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{res.subtitle}</p>
                    <p className="text-[11px] mt-1 font-semibold">
                      Saldo:{' '}
                      <span className={res.balance > 0 ? 'text-red-600' : 'text-emerald-600'}>
                        {res.balance > 0 ? `$${res.balance.toLocaleString('es-AR')}` : 'Al día'}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => jumpToDate(res.date)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                      title="Navegar al mes de esta entrega"
                    >
                      Ir a fecha
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openInvoiceModal(res.order)}
                        className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Factura PDF"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const isV = res.type === 'vehicle';
                          const foundClient = clients.find((c) => c.id === res.order.clientId);
                          openWhatsAppModal({
                            clientPhone: foundClient?.phone || '',
                            clientName: res.order.clientName,
                            itemDescription: isV
                              ? (res.order as WorkOrder).vehiclePlate
                              : (res.order as FurnitureOrder).furnitureType,
                            balanceDue: res.order.balanceDue,
                            totalAmount: res.order.totalAmount,
                            deliveryDate: res.order.deliveryDate,
                            invoiceNumber: res.order.id,
                            defaultTemplate: res.balance > 0 ? 'debt_reminder' : 'ready',
                          });
                        }}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (res.type === 'vehicle') {
                            openWorkOrderModal(res.order as WorkOrder);
                          } else {
                            openFurnitureModal(res.order as FurnitureOrder);
                          }
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(res.order, res.type)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar orden"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-1">
              No se encontraron entregas programadas que coincidan con la búsqueda.
            </p>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-2">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-slate-50/50 p-1.5 text-slate-300"></div>
          ))}

          {/* Days of month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const deliveries = getDeliveriesForDate(formattedDate);
            const isToday = dayNum === 8 && month === 9 && year === 2026;
            const hasMatch = searchQuery.trim() && deliveries.length > 0;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[115px] p-1.5 transition-colors flex flex-col justify-between ${
                  hasMatch
                    ? 'bg-amber-50/40 ring-1 ring-amber-400'
                    : isToday
                    ? 'bg-blue-50/40 ring-1 ring-blue-500 inset-0'
                    : 'hover:bg-blue-50/20'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : hasMatch
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {deliveries.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {deliveries.length} {deliveries.length === 1 ? 'entrega' : 'entregas'}
                    </span>
                  )}
                </div>

                {/* Delivery Badges */}
                <div className="space-y-1 flex-1 overflow-y-auto max-h-[88px]">
                  {deliveries.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemDetail({ order: item.raw, type: item.type })}
                      className={`p-1 rounded text-[10px] cursor-pointer border transition-transform hover:scale-[1.02] shadow-2xs ${
                        item.type === 'vehicle'
                          ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100/70'
                          : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100/70'
                      }`}
                      title="Clic para opciones (Ver, Factura, WhatsApp, Eliminar)"
                    >
                      <div className="flex items-center justify-between gap-1 font-semibold truncate">
                        <span className="flex items-center gap-0.5 truncate">
                          {item.type === 'vehicle' ? (
                            <Car className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                          ) : (
                            <Armchair className="w-2.5 h-2.5 shrink-0 text-amber-600" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] mt-0.5">
                        <span className="text-slate-500 truncate max-w-[80px]">{item.subtitle}</span>
                        <span className={`font-bold ${item.balance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                          {item.balance > 0 ? `$${item.balance.toLocaleString('es-AR')}` : 'Al día'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Delivery Action Modal / Popup */}
      {selectedItemDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    selectedItemDetail.type === 'vehicle'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {selectedItemDetail.type === 'vehicle' ? (
                    <Car className="w-5 h-5" />
                  ) : (
                    <Armchair className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedItemDetail.type === 'vehicle'
                      ? `Vehículo: ${(selectedItemDetail.order as WorkOrder).vehiclePlate}`
                      : `Mueble: ${(selectedItemDetail.order as FurnitureOrder).furnitureType}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fecha de entrega: {selectedItemDetail.order.deliveryDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemDetail(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details body */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-bold text-slate-900">{selectedItemDetail.order.clientName}</span>
                </div>
                {selectedItemDetail.type === 'vehicle' ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modelo:</span>
                    <span className="font-semibold text-slate-800">
                      {(selectedItemDetail.order as WorkOrder).vehicleModel}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-slate-500">Total presupuestado:</span>
                  <span className="font-bold text-slate-900">
                    ${selectedItemDetail.order.totalAmount.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo pendiente:</span>
                  <span
                    className={`font-bold ${
                      selectedItemDetail.order.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedItemDetail.order.balanceDue > 0
                      ? `$${selectedItemDetail.order.balanceDue.toLocaleString('es-AR')}`
                      : 'Pagado completo ($0)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="font-medium capitalize text-slate-700">
                    {selectedItemDetail.order.status === 'completed'
                      ? 'Completado'
                      : selectedItemDetail.order.status === 'on_hold'
                      ? 'En espera'
                      : 'En progreso'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Observaciones / Detalle:</span>
                <p className="bg-white p-2 border border-slate-200 rounded text-slate-700 text-[11px] italic">
                  {selectedItemDetail.type === 'vehicle'
                    ? (selectedItemDetail.order as WorkOrder).technicalNotes || 'Sin notas'
                    : (selectedItemDetail.order as FurnitureOrder).observations || 'Sin notas'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 justify-between">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedItemDetail.order, selectedItemDetail.type)}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Orden</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    downloadInvoicePDF(selectedItemDetail.order, null, 'Factura B');
                  }}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
                  title="Descargar PDF directo"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => {
                    const isV = selectedItemDetail.type === 'vehicle';
                    const foundClient = clients.find((c) => c.id === selectedItemDetail.order.clientId);
                    openWhatsAppModal({
                      clientPhone: foundClient?.phone || '',
                      clientName: selectedItemDetail.order.clientName,
                      itemDescription: isV
                        ? (selectedItemDetail.order as WorkOrder).vehiclePlate
                        : (selectedItemDetail.order as FurnitureOrder).furnitureType,
                      balanceDue: selectedItemDetail.order.balanceDue,
                      totalAmount: selectedItemDetail.order.totalAmount,
                      deliveryDate: selectedItemDetail.order.deliveryDate,
                      invoiceNumber: selectedItemDetail.order.id,
                      defaultTemplate: selectedItemDetail.order.balanceDue > 0 ? 'debt_reminder' : 'ready',
                    });
                    setSelectedItemDetail(null);
                  }}
                  className="px-2.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1"
                  title="Enviar WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    if (selectedItemDetail.type === 'vehicle') {
                      openWorkOrderModal(selectedItemDetail.order as WorkOrder);
                    } else {
                      openFurnitureModal(selectedItemDetail.order as FurnitureOrder);
                    }
                    setSelectedItemDetail(null);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
