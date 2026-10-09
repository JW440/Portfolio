import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Car,
  Armchair,
  DollarSign,
  AlertCircle,
  Calendar,
  CreditCard,
  Plus,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    clients,
    workOrders,
    furnitureOrders,
    payments,
    setActiveTab,
    openWorkOrderModal,
    openFurnitureModal,
    openPaymentModal,
    openInvoiceModal,
  } = useApp();

  const totalClientsWithDebt = clients.filter((c) => (c.totalDebt || 0) > 0);
  const totalDebtAmount = clients.reduce((sum, c) => sum + (c.totalDebt || 0), 0);

  const activeVehicles = workOrders.filter((w) => w.status === 'in_progress');
  const activeFurniture = furnitureOrders.filter((f) => f.status === 'in_progress');

  const monthlyPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Deliveries within next 14 days
  const todayStr = '2026-10-08';
  const upcomingVehicles = workOrders.filter((w) => w.deliveryDate >= todayStr && w.status !== 'completed');
  const upcomingFurniture = furnitureOrders.filter((f) => f.deliveryDate >= todayStr && f.status !== 'completed');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
            <span>Directorio de Clientes, Vehículos &amp; Muebles</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Control de Gestión de Clientes</h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Seguimiento de clientes, entregas programadas en calendario, órdenes activas y cobranza de saldos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Calendario</span>
          </button>

          <button
            onClick={() => openPaymentModal(null)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobrar Abono</span>
          </button>

          <button
            onClick={() => openFurnitureModal(null)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mueble</span>
          </button>

          <button
            onClick={() => openWorkOrderModal(null)}
            className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Auto</span>
          </button>
        </div>
      </div>

      {/* 4 KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Autos en Taller */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Autos en Tapizado</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeVehicles.length}</div>
            <div className="text-xs text-blue-700 font-semibold mt-1">
              {workOrders.filter((w) => w.status === 'completed').length} terminados
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tapicería vehicular</span>
            <button onClick={() => setActiveTab('vehicles')} className="text-blue-600 hover:underline font-semibold">
              Ver autos →
            </button>
          </div>
        </div>

        {/* KPI 2: Muebles en Proceso */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Muebles en Proceso</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Armchair className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{activeFurniture.length}</div>
            <div className="text-xs text-amber-800 font-semibold mt-1">
              Sofás, sillas y respaldos
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Apartado muebles</span>
            <button onClick={() => setActiveTab('furniture')} className="text-blue-600 hover:underline font-semibold">
              Ver muebles →
            </button>
          </div>
        </div>

        {/* KPI 3: Saldos por Cobrar */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldos por Cobrar</span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-700">${totalDebtAmount.toLocaleString('es-AR')}</div>
            <div className="text-xs text-red-600 font-medium mt-1">
              {totalClientsWithDebt.length} clientes con saldo pendiente
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cuentas corrientes</span>
            <button onClick={() => setActiveTab('payments')} className="text-blue-600 hover:underline font-semibold">
              Cobranzas →
            </button>
          </div>
        </div>

        {/* KPI 4: Recaudación Histórica */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingresos Recaudados</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">${monthlyPayments.toLocaleString('es-AR')}</div>
            <div className="text-xs text-emerald-700 font-semibold mt-1">
              {payments.length} recibos cobrados
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Caja del taller</span>
            <button onClick={() => setActiveTab('invoices')} className="text-blue-600 hover:underline font-semibold">
              Facturación →
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Próximas Entregas de la Semana & Deudores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Próximas Entregas (Calendario Highlight) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Próximas Entregas de Tapicería Programadas</span>
              </h2>
              <p className="text-xs text-slate-500">Compromisos de entrega vehicular y muebles</p>
            </div>
            <button onClick={() => setActiveTab('calendar')} className="text-xs font-semibold text-blue-600 hover:underline">
              Abrir Calendario Completo →
            </button>
          </div>

          <div className="space-y-3">
            {/* Vehicle upcoming */}
            {upcomingVehicles.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-lg border border-blue-200/60 bg-blue-50/20 hover:bg-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {v.vehiclePlate}
                    </span>
                    <strong className="text-slate-800 text-xs">{v.vehicleModel}</strong>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">Auto</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{v.technicalNotes}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Cliente: <strong>{v.clientName}</strong></span>
                    <span>•</span>
                    <span className="text-blue-700 font-semibold">Entrega: {v.deliveryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span className={`text-xs font-bold ${v.balanceDue > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      ${v.balanceDue.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    onClick={() => openInvoiceModal(v)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs"
                    title="Sacar Factura PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  {v.balanceDue > 0 && (
                    <button
                      onClick={() =>
                        openPaymentModal({
                          id: v.id,
                          type: 'vehicle',
                          balanceDue: v.balanceDue,
                          clientName: v.clientName,
                          description: `${v.vehiclePlate} (${v.vehicleModel})`,
                        })
                      }
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      Abonar
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Furniture upcoming */}
            {upcomingFurniture.map((f) => (
              <div
                key={f.id}
                className="p-3.5 rounded-lg border border-amber-200/60 bg-amber-50/20 hover:bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-amber-700" />
                    <strong className="text-slate-900 text-xs">{f.furnitureType}</strong>
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">Mueble</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{f.observations}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Cliente: <strong>{f.clientName}</strong></span>
                    <span>•</span>
                    <span className="text-amber-800 font-semibold">Entrega: {f.deliveryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-slate-400 block">Saldo</span>
                    <span className={`text-xs font-bold ${f.balanceDue > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                      ${f.balanceDue.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    onClick={() => openInvoiceModal(f)}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded text-xs"
                    title="Sacar Factura PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  {f.balanceDue > 0 && (
                    <button
                      onClick={() =>
                        openPaymentModal({
                          id: f.id,
                          type: 'furniture',
                          balanceDue: f.balanceDue,
                          clientName: f.clientName,
                          description: f.furnitureType,
                        })
                      }
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                    >
                      Abonar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Clientes Morosos */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Clientes con Saldo Pendiente</span>
            </h3>
            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">
              {totalClientsWithDebt.length}
            </span>
          </div>

          <div className="space-y-2.5">
            {totalClientsWithDebt.map((c) => (
              <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{c.fullName}</div>
                  <div className="text-[11px] text-slate-500">{c.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-700">${c.totalDebt.toLocaleString('es-AR')}</div>
                  <button
                    onClick={() => {
                      const v = workOrders.find((w) => w.clientId === c.id && w.balanceDue > 0);
                      const f = furnitureOrders.find((fur) => fur.clientId === c.id && fur.balanceDue > 0);
                      if (v) {
                        openPaymentModal({ id: v.id, type: 'vehicle', balanceDue: v.balanceDue, clientName: c.fullName, description: v.vehiclePlate });
                      } else if (f) {
                        openPaymentModal({ id: f.id, type: 'furniture', balanceDue: f.balanceDue, clientName: c.fullName, description: f.furnitureType });
                      } else {
                        setActiveTab('payments');
                      }
                    }}
                    className="text-[10px] text-emerald-700 font-semibold hover:underline"
                  >
                    Cobrar abono
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('invoices')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg text-center"
          >
            Ver Módulo de Facturación &amp; Reportes
          </button>
        </div>
      </div>
    </div>
  );
};
