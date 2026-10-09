import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WorkOrder, OrderStatus } from '../types';
import { X, Car, Calendar, Check, Info, Trash2 } from 'lucide-react';

export const WorkOrderModal: React.FC = () => {
  const {
    modalState,
    closeWorkOrderModal,
    clients,
    createWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,
    openConfirmModal,
    openClientModal,
  } = useApp();
  const { workOrderModalOpen, selectedWorkOrder } = modalState;

  const [clientId, setClientId] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('in_progress');
  const [totalAmount, setTotalAmount] = useState<number | string>('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string>('');

  const [isManualOverride, setIsManualOverride] = useState(false);
  const [customBalance, setCustomBalance] = useState<number | string>('');
  const [manualReason, setManualReason] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const numericTotal = Number(totalAmount) || 0;
  const calculatedAutoBalance = Math.max(0, numericTotal - paidAmount);
  const effectiveBalance = isManualOverride && customBalance !== '' ? Number(customBalance) : calculatedAutoBalance;

  useEffect(() => {
    if (selectedWorkOrder) {
      setClientId(selectedWorkOrder.clientId || (clients[0]?.id || ''));
      setVehiclePlate(selectedWorkOrder.vehiclePlate || '');
      setVehicleModel(selectedWorkOrder.vehicleModel || '');
      setTechnicalNotes(selectedWorkOrder.technicalNotes || '');
      setStatus(selectedWorkOrder.status || 'in_progress');
      setTotalAmount(selectedWorkOrder.totalAmount || '');
      setPaidAmount(selectedWorkOrder.paidAmount || 0);
      setDeliveryDate(selectedWorkOrder.deliveryDate || '');
      setIsManualOverride(selectedWorkOrder.isManualBalanceOverride || false);
      setCustomBalance(selectedWorkOrder.isManualBalanceOverride ? selectedWorkOrder.balanceDue : '');
      setManualReason(selectedWorkOrder.manualBalanceReason || '');
    } else {
      setClientId(clients[0]?.id || '');
      setVehiclePlate('');
      setVehicleModel('');
      setTechnicalNotes('');
      setStatus('in_progress');
      setTotalAmount('');
      setPaidAmount(0);
      setDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
      setIsManualOverride(false);
      setCustomBalance('');
      setManualReason('');
    }
    setError('');
  }, [selectedWorkOrder, workOrderModalOpen, clients]);

  if (!workOrderModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Debes seleccionar un cliente.');
      return;
    }
    if (!vehiclePlate.trim()) {
      setError('La patente del vehículo es obligatoria.');
      return;
    }
    if (!vehicleModel.trim()) {
      setError('El modelo del vehículo es obligatorio.');
      return;
    }
    if (numericTotal <= 0) {
      setError('El monto total presupuestado debe ser mayor a 0.');
      return;
    }

    setLoading(true);
    setError('');

    const targetClient = clients.find((c) => c.id === clientId);
    const clientName = targetClient ? targetClient.fullName : 'Cliente';

    try {
      if (selectedWorkOrder && selectedWorkOrder.id) {
        await updateWorkOrder(selectedWorkOrder.id, {
          clientId,
          clientName,
          vehiclePlate: vehiclePlate.toUpperCase().trim(),
          vehicleModel: vehicleModel.trim(),
          technicalNotes: technicalNotes.trim(),
          status,
          totalAmount: numericTotal,
          deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
          balanceDue: isManualOverride && customBalance !== '' ? Number(customBalance) : undefined,
          isManualBalanceOverride: isManualOverride,
          manualBalanceReason: isManualOverride ? manualReason.trim() : '',
        });
      } else {
        await createWorkOrder({
          clientId,
          clientName,
          vehiclePlate: vehiclePlate.toUpperCase().trim(),
          vehicleModel: vehicleModel.trim(),
          technicalNotes: technicalNotes.trim(),
          status,
          totalAmount: numericTotal,
          deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
          isManualBalanceOverride: isManualOverride,
          manualBalanceReason: isManualOverride ? manualReason.trim() : '',
          customBalance: isManualOverride && customBalance !== '' ? Number(customBalance) : undefined,
        });
      }
      closeWorkOrderModal();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedWorkOrder?.id ? `Editar Tapicería Auto #${selectedWorkOrder.id}` : 'Nuevo Trabajo de Tapicería Automotriz'}
              </h3>
              <p className="text-[11px] text-slate-500">Tapicería Automotriz por Patente</p>
            </div>
          </div>
          <button onClick={closeWorkOrderModal} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Cliente Asociado <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => openClientModal(null)}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline"
                title="Registrar nuevo cliente"
              >
                + Nuevo Cliente
              </button>
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patente / Placa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. AE 412 KL"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Modelo del Auto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Toyota Hilux 2021"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones (Detalle del Tapizado, Telas, Butacas, Techo, Volante)
            </label>
            <textarea
              rows={3}
              placeholder="Especificar butacas, paneles de puerta, techo, volante, material (cuero, cuerina, tela original), color de costura..."
              value={technicalNotes}
              onChange={(e) => setTechnicalNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Entrega Programada <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado del Trabajo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="in_progress">En progreso (en taller)</option>
                <option value="on_hold">En espera de materiales</option>
                <option value="completed">Completado / Terminado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monto Total Presupuestado ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              required
              placeholder="Ej. 320000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Saldo Calculado:</span>
            <span className={`font-bold ${effectiveBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              ${effectiveBalance.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            {selectedWorkOrder?.id ? (
              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: `¿Eliminar trabajo #${selectedWorkOrder.id}?`,
                    message: `Se eliminará la orden de ${selectedWorkOrder.vehiclePlate} (${selectedWorkOrder.vehicleModel}) y se actualizarán los saldos.`,
                    confirmLabel: 'Sí, Eliminar Trabajo',
                    danger: true,
                    onConfirm: () => {
                      deleteWorkOrder(selectedWorkOrder.id);
                      closeWorkOrderModal();
                    },
                  });
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Trabajo</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeWorkOrderModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedWorkOrder?.id ? 'Actualizar Trabajo' : 'Registrar Trabajo'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
