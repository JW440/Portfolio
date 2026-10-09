import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FurnitureOrder, OrderStatus } from '../types';
import { X, Armchair, Calendar, Check, Info, Trash2 } from 'lucide-react';

export const FurnitureModal: React.FC = () => {
  const {
    modalState,
    closeFurnitureModal,
    clients,
    createFurnitureOrder,
    updateFurnitureOrder,
    deleteFurnitureOrder,
    openConfirmModal,
    openClientModal,
  } = useApp();
  const { furnitureModalOpen, selectedFurnitureOrder } = modalState;

  const [clientId, setClientId] = useState('');
  const [furnitureType, setFurnitureType] = useState('');
  const [observations, setObservations] = useState('');
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
    if (selectedFurnitureOrder) {
      setClientId(selectedFurnitureOrder.clientId || (clients[0]?.id || ''));
      setFurnitureType(selectedFurnitureOrder.furnitureType || '');
      setObservations(selectedFurnitureOrder.observations || '');
      setStatus(selectedFurnitureOrder.status || 'in_progress');
      setTotalAmount(selectedFurnitureOrder.totalAmount || '');
      setPaidAmount(selectedFurnitureOrder.paidAmount || 0);
      setDeliveryDate(selectedFurnitureOrder.deliveryDate || '');
      setIsManualOverride(selectedFurnitureOrder.isManualBalanceOverride || false);
      setCustomBalance(selectedFurnitureOrder.isManualBalanceOverride ? selectedFurnitureOrder.balanceDue : '');
      setManualReason(selectedFurnitureOrder.manualBalanceReason || '');
    } else {
      setClientId(clients[0]?.id || '');
      setFurnitureType('');
      setObservations('');
      setStatus('in_progress');
      setTotalAmount('');
      setPaidAmount(0);
      setDeliveryDate(new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10));
      setIsManualOverride(false);
      setCustomBalance('');
      setManualReason('');
    }
    setError('');
  }, [selectedFurnitureOrder, furnitureModalOpen, clients]);

  if (!furnitureModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError('Selecciona un cliente.');
      return;
    }
    if (!furnitureType.trim()) {
      setError('Ingresa el tipo de mueble.');
      return;
    }
    if (numericTotal <= 0) {
      setError('El monto total debe ser mayor a 0.');
      return;
    }

    setLoading(true);
    setError('');

    const targetClient = clients.find((c) => c.id === clientId);
    const clientName = targetClient ? targetClient.fullName : 'Cliente';

    try {
      if (selectedFurnitureOrder && selectedFurnitureOrder.id) {
        await updateFurnitureOrder(selectedFurnitureOrder.id, {
          clientId,
          clientName,
          furnitureType: furnitureType.trim(),
          observations: observations.trim(),
          status,
          totalAmount: numericTotal,
          deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
          balanceDue: isManualOverride && customBalance !== '' ? Number(customBalance) : undefined,
          isManualBalanceOverride: isManualOverride,
          manualBalanceReason: isManualOverride ? manualReason.trim() : '',
        });
      } else {
        await createFurnitureOrder({
          clientId,
          clientName,
          furnitureType: furnitureType.trim(),
          observations: observations.trim(),
          status,
          totalAmount: numericTotal,
          deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
          isManualBalanceOverride: isManualOverride,
          manualBalanceReason: isManualOverride ? manualReason.trim() : '',
          customBalance: isManualOverride && customBalance !== '' ? Number(customBalance) : undefined,
        });
      }
      closeFurnitureModal();
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
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Armchair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedFurnitureOrder?.id ? `Editar Trabajo de Mueble #${selectedFurnitureOrder.id}` : 'Nuevo Trabajo de Mueble'}
              </h3>
              <p className="text-[11px] text-slate-500">Tapicería &amp; Mueblería Hogar</p>
            </div>
          </div>
          <button onClick={closeFurnitureModal} className="p-1 rounded text-slate-400 hover:text-slate-600">
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
                className="text-[11px] text-amber-700 hover:text-amber-900 font-bold hover:underline"
                title="Registrar nuevo cliente"
              >
                + Nuevo Cliente
              </button>
            </div>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mueble / Artículo a Tapizar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sofá Chesterfield 3 cuerpos, 6 sillas comedor, Butaca..."
              value={furnitureType}
              onChange={(e) => setFurnitureType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones (Tela, Color, Relleno, Estructura, Tachas)
            </label>
            <textarea
              rows={3}
              placeholder="Detallar tipo de tela (pana, lino, cuero, chenille), densidad de espuma, vivos, capitoné..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Entrega Programada <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado del Mueble
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="in_progress">En progreso (en taller)</option>
                <option value="on_hold">En espera (esperando tela)</option>
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
              placeholder="Ej. 450000"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Saldo Calculado:</span>
            <span className={`font-bold ${effectiveBalance > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
              ${effectiveBalance.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            {selectedFurnitureOrder?.id ? (
              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: `¿Eliminar trabajo #${selectedFurnitureOrder.id}?`,
                    message: `Se eliminará la orden de ${selectedFurnitureOrder.furnitureType} y se actualizarán los saldos.`,
                    confirmLabel: 'Sí, Eliminar Mueble',
                    danger: true,
                    onConfirm: () => {
                      deleteFurnitureOrder(selectedFurnitureOrder.id);
                      closeFurnitureModal();
                    },
                  });
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Mueble</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeFurnitureModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{selectedFurnitureOrder?.id ? 'Actualizar Mueble' : 'Guardar Mueble'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
