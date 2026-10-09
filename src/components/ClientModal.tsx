import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Users, Phone, Mail, FileText, Check, Trash2 } from 'lucide-react';

export const ClientModal: React.FC = () => {
  const { modalState, closeClientModal, addClient, updateClient, deleteClient, openConfirmModal } = useApp();
  const { clientModalOpen, selectedClient } = modalState;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClient) {
      setFullName(selectedClient.fullName);
      setPhone(selectedClient.phone);
      setEmail(selectedClient.email || '');
      setAddress(selectedClient.address || '');
      setNotes(selectedClient.notes || '');
    } else {
      setFullName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNotes('');
    }
    setError('');
  }, [selectedClient, clientModalOpen]);

  if (!clientModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('El nombre completo del cliente es obligatorio.');
      return;
    }
    if (!phone.trim()) {
      setError('El número de teléfono es obligatorio para la gestión de servicios.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (selectedClient) {
        await updateClient(selectedClient.id, {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
      } else {
        await addClient({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          notes: notes.trim(),
        });
      }
      closeClientModal();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-2xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedClient ? 'Editar Datos de Cliente' : 'Alta de Nuevo Cliente'}
              </h3>
              <p className="text-[11px] text-slate-500">Gestión de Clientes • Directorio de Clientes</p>
            </div>
          </div>
          <button
            onClick={closeClientModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre Completo / Razón Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Roberto Sánchez o Flota Sur S.R.L."
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Teléfono / WhatsApp <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="+54 9 11 4589-2310"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo (Opcional)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección / Ciudad (Opcional)
              </label>
              <input
                type="text"
                placeholder="Av. Santa Fe 1234, CABA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones / Términos de Cuenta Corriente
            </label>
            <textarea
              rows={2}
              placeholder="Notas comerciales, límite de crédito o requerimientos especiales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
            {selectedClient ? (
              <button
                type="button"
                onClick={() => {
                  openConfirmModal({
                    title: `¿Eliminar al cliente ${selectedClient.fullName}?`,
                    message: `Se eliminará el cliente y se cancelarán todas sus órdenes asociadas.`,
                    confirmLabel: 'Sí, Eliminar Cliente',
                    danger: true,
                    onConfirm: () => {
                      deleteClient(selectedClient.id);
                      closeClientModal();
                    },
                  });
                }}
                className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Cliente</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeClientModal}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedClient ? 'Actualizar Cliente' : 'Crear Cliente'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
