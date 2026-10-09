import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import { X, Receipt, Check } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { modalState, closePaymentModal, workOrders, furnitureOrders, addPayment, currentUser } = useApp();
  const { paymentModalOpen, paymentTarget } = modalState;

  const [targetType, setTargetType] = useState<'vehicle' | 'furniture'>('vehicle');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [amount, setAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (paymentTarget) {
      setTargetType(paymentTarget.type);
      setSelectedOrderId(paymentTarget.id);
      setAmount(paymentTarget.balanceDue > 0 ? paymentTarget.balanceDue : '');
    } else {
      setTargetType('vehicle');
      const firstDebtOrder = workOrders.find((w) => w.balanceDue > 0) || workOrders[0];
      if (firstDebtOrder) {
        setSelectedOrderId(firstDebtOrder.id);
        setAmount(firstDebtOrder.balanceDue > 0 ? firstDebtOrder.balanceDue : '');
      }
    }
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setReferenceNumber('');
    setNotes('');
    setError('');
  }, [paymentTarget, paymentModalOpen, workOrders]);

  if (!paymentModalOpen) return null;

  const currentOrder =
    targetType === 'vehicle'
      ? workOrders.find((o) => o.id === selectedOrderId)
      : furnitureOrders.find((f) => f.id === selectedOrderId);

  const numericAmount = Number(amount) || 0;
  const currentBalance = currentOrder ? currentOrder.balanceDue : 0;
  const remainingBalance = Math.max(0, currentBalance - numericAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) {
      setError('Debes seleccionar un trabajo para imputar el pago.');
      return;
    }
    if (numericAmount <= 0) {
      setError('El monto a abonar debe ser mayor a 0.');
      return;
    }

    setLoading(true);
    setError('');

    const itemDesc =
      targetType === 'vehicle'
        ? `${(currentOrder as any).vehiclePlate} (${(currentOrder as any).vehicleModel})`
        : (currentOrder as any).furnitureType;

    try {
      await addPayment({
        orderId: currentOrder.id,
        orderType: targetType,
        clientId: currentOrder.clientId,
        clientName: currentOrder.clientName,
        itemDescription: itemDesc,
        amount: numericAmount,
        paymentMethod,
        paymentDate,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        recordedBy: currentUser.name,
      });
      closePaymentModal();
    } catch (err: any) {
      setError(err?.message || 'Error al asentar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registrar Cobro / Abono Parcial</h3>
              <p className="text-[11px] text-slate-500">Actualización automática de saldo y cuenta corriente</p>
            </div>
          </div>
          <button onClick={closePaymentModal} className="p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Sector Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rubro de Tapicería</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTargetType('vehicle');
                  const first = workOrders.find((w) => w.balanceDue > 0) || workOrders[0];
                  if (first) {
                    setSelectedOrderId(first.id);
                    setAmount(first.balanceDue);
                  }
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  targetType === 'vehicle' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Autos (Patentes)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTargetType('furniture');
                  const first = furnitureOrders.find((f) => f.balanceDue > 0) || furnitureOrders[0];
                  if (first) {
                    setSelectedOrderId(first.id);
                    setAmount(first.balanceDue);
                  }
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  targetType === 'furniture' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Muebles &amp; Hogar
              </button>
            </div>
          </div>

          {/* Target Order Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Imputar al Trabajo <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedOrderId(id);
                const order =
                  targetType === 'vehicle'
                    ? workOrders.find((w) => w.id === id)
                    : furnitureOrders.find((f) => f.id === id);
                if (order) setAmount(order.balanceDue);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
            >
              {targetType === 'vehicle'
                ? workOrders.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.vehiclePlate} ({w.vehicleModel}) — {w.clientName} [Saldo: ${w.balanceDue.toLocaleString('es-AR')}]
                    </option>
                  ))
                : furnitureOrders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.furnitureType} — {f.clientName} [Saldo: ${f.balanceDue.toLocaleString('es-AR')}]
                    </option>
                  ))}
            </select>
          </div>

          {/* Balance Preview Card */}
          {currentOrder && (
            <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/40 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Total</span>
                <strong className="text-slate-800">${currentOrder.totalAmount.toLocaleString('es-AR')}</strong>
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Saldo Actual</span>
                <strong className="text-red-700">${currentOrder.balanceDue.toLocaleString('es-AR')}</strong>
              </div>
              <div className="p-1.5 bg-white rounded border border-emerald-100">
                <span className="text-[10px] text-slate-500 block">Quedará</span>
                <strong className="text-emerald-800">${remainingBalance.toLocaleString('es-AR')}</strong>
              </div>
            </div>
          )}

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Monto a Cobrar ($) <span className="text-red-500">*</span>
              </label>
              {currentOrder && currentOrder.balanceDue > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentOrder.balanceDue)}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Cobrar Total (${currentOrder.balanceDue.toLocaleString('es-AR')})
                </button>
              )}
            </div>
            <input
              type="number"
              min="1"
              required
              placeholder="Ej. 150000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Medio de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="transfer">Transferencia Bancaria</option>
                <option value="cash">Efectivo en Taller</option>
                <option value="card">Tarjeta Débito/Crédito</option>
                <option value="other">Cheque / Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Pago</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">N° Comprobante / Recibo</label>
            <input
              type="text"
              placeholder="Ej. TRF-8812 o REC-045"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closePaymentModal}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Registrar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
