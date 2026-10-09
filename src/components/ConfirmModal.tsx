import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { modalState, closeConfirmModal } = useApp();
  const { confirmModalOpen, confirmModalData } = modalState;

  if (!confirmModalOpen || !confirmModalData) return null;

  const {
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = true,
    onConfirm,
  } = confirmModalData;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (e) {
      console.error(e);
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 border border-slate-100">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              danger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            {danger ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{message}</p>
          </div>

          <button
            onClick={closeConfirmModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={closeConfirmModal}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400'
            }`}
          >
            {danger && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
