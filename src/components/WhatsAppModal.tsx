import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Check,
  User,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ExternalLink,
} from 'lucide-react';
import { buildWhatsAppUrl, generateWhatsAppMessage } from '../utils/whatsapp';

export const WhatsAppModal: React.FC = () => {
  const { modalState, closeWhatsAppModal } = useApp();
  const { whatsappModalOpen, whatsappData } = modalState;

  const [selectedTemplate, setSelectedTemplate] = useState<
    'ready' | 'in_progress' | 'debt_reminder' | 'invoice' | 'custom'
  >('ready');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (whatsappData) {
      const initialTemplate = whatsappData.defaultTemplate || 'ready';
      setSelectedTemplate(initialTemplate);
      setPhoneNumber(whatsappData.clientPhone || '');

      const initialText = generateWhatsAppMessage(initialTemplate, {
        clientName: whatsappData.clientName,
        itemDescription: whatsappData.itemDescription,
        totalAmount: whatsappData.totalAmount,
        paidAmount: whatsappData.paidAmount,
        balanceDue: whatsappData.balanceDue,
        deliveryDate: whatsappData.deliveryDate,
        notes: whatsappData.notes,
        invoiceNumber: whatsappData.invoiceNumber,
      });
      setMessage(initialText);
      setCopied(false);
    }
  }, [whatsappData, whatsappModalOpen]);

  if (!whatsappModalOpen || !whatsappData) return null;

  const handleTemplateChange = (
    tpl: 'ready' | 'in_progress' | 'debt_reminder' | 'invoice' | 'custom'
  ) => {
    setSelectedTemplate(tpl);
    if (tpl === 'custom') {
      setMessage(`¡Hola ${whatsappData.clientName}! Te escribimos de Gestión de Clientes: `);
    } else {
      const text = generateWhatsAppMessage(tpl, {
        clientName: whatsappData.clientName,
        itemDescription: whatsappData.itemDescription,
        totalAmount: whatsappData.totalAmount,
        paidAmount: whatsappData.paidAmount,
        balanceDue: whatsappData.balanceDue,
        deliveryDate: whatsappData.deliveryDate,
        notes: whatsappData.notes,
        invoiceNumber: whatsappData.invoiceNumber,
      });
      setMessage(text);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappUrl = buildWhatsAppUrl(phoneNumber, message);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Mensaje Automático por WhatsApp</h3>
              <p className="text-[11px] text-emerald-100 font-medium">
                Notificación instantánea de tapicería a {whatsappData.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={closeWhatsAppModal}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Target Info Pill */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Referencia del Trabajo
              </span>
              <p className="font-bold text-slate-900 text-xs">{whatsappData.itemDescription}</p>
            </div>

            <div className="flex items-center gap-4">
              {whatsappData.balanceDue !== undefined && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Saldo</span>
                  <span
                    className={`font-black ${
                      whatsappData.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    ${whatsappData.balanceDue.toLocaleString('es-AR')}
                  </span>
                </div>
              )}

              {whatsappData.deliveryDate && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Entrega</span>
                  <span className="font-semibold text-slate-700">{whatsappData.deliveryDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Destinatario y Número de WhatsApp:
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+54 9 11 4589-2310"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 font-semibold"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Se formatea automáticamente con código de país para abrir el chat directo en WhatsApp Web o Móvil.
            </p>
          </div>

          {/* Template Selectors */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Plantillas Automáticas de Notificación:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleTemplateChange('ready')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'ready'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs">Listo p/ Retirar</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Trabajo finalizado</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('in_progress')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'in_progress'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs">En Proceso</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Avance de tapicería</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('debt_reminder')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'debt_reminder'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs">Saldo &amp; CBU</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Recordatorio y alias</span>
              </button>

              <button
                type="button"
                onClick={() => handleTemplateChange('invoice')}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedTemplate === 'invoice'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-xs">Comprobante</span>
                </div>
                <span className="text-[10px] text-slate-500 block">Datos de factura</span>
              </button>
            </div>
          </div>

          {/* Editable Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Mensaje a Enviar (Personalizable):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">¡Texto copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar texto</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed text-slate-800 bg-slate-50/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={closeWhatsAppModal}
              className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTimeout(() => closeWhatsAppModal(), 400);
                }}
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-md transition-all flex items-center gap-2 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-200" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
