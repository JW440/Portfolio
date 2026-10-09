import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Car,
  Armchair,
  Receipt,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MapPin,
  UserPlus,
  Check,
  X,
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    workOrders,
    furnitureOrders,
    payments,
    openClientModal,
    openWorkOrderModal,
    openFurnitureModal,
    openPaymentModal,
    openInvoiceModal,
    openWhatsAppModal,
    addClient,
    deleteClient,
    openConfirmModal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [debtFilter, setDebtFilter] = useState<'all' | 'debtors' | 'paid'>('all');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  // Dedicated Add New Client Section State
  const [showAddSection, setShowAddSection] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleQuickAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Por favor ingresa el nombre completo del cliente.');
      return;
    }
    if (!newPhone.trim()) {
      setFormError('Por favor ingresa el número de teléfono o WhatsApp.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      await addClient({
        fullName: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim(),
        address: newAddress.trim(),
        notes: newNotes.trim(),
      });
      const addedName = newName.trim();
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewAddress('');
      setNewNotes('');
      setSuccessBanner(`¡Cliente "${addedName}" registrado exitosamente en el sistema!`);
      setTimeout(() => setSuccessBanner(null), 4500);
    } catch (err: any) {
      setFormError(err?.message || 'Error al guardar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      workOrders.some((o) => o.clientId === client.id && o.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      furnitureOrders.some((f) => f.clientId === client.id && f.furnitureType.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (debtFilter === 'debtors') return (client.totalDebt || 0) > 0;
    if (debtFilter === 'paid') return (client.totalDebt || 0) === 0;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Directorio &amp; Gestión de Clientes</span>
          </h1>
          <p className="text-xs text-slate-500">
            Registro de nuevos clientes, cuentas corrientes, historial de autos y muebles, y mensajes por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
              showAddSection
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>{showAddSection ? 'Ocultar Sección Alta' : 'Mostrar Sección Alta'}</span>
          </button>

          <button
            onClick={() => openClientModal(null)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Cliente (Modal)</span>
          </button>
        </div>
      </div>

      {/* DEDICATED SECTION: AGREGAR NUEVOS CLIENTES */}
      {showAddSection && (
        <div className="bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50 border border-blue-200/80 rounded-2xl p-5 shadow-xs transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Sección: Agregar Nuevo Cliente</span>
                  <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Alta Directa
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  Registra un cliente para asociarlo de inmediato a órdenes de tapicería vehicular o muebles.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAddSection(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="Cerrar panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {successBanner && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleQuickAddClient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Nombre */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nombre Completo / Razón Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Sánchez o Flota Sur"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs"
                />
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Teléfono / WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="+54 9 11 4589-2310"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Dirección / Domicilio (Opcional)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Av. Rivadavia 2400, CABA"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones & Submit */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex-1 max-w-2xl">
                <input
                  type="text"
                  placeholder="Observaciones iniciales del cliente (preferencias de telas, condiciones de pago, etc.)..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNewName('');
                    setNewPhone('');
                    setNewEmail('');
                    setNewAddress('');
                    setNewNotes('');
                    setFormError('');
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Registrando...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Registrar Nuevo Cliente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, teléfono, patente o mueble..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Estado:</span>
          <button
            onClick={() => setDebtFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              debtFilter === 'all' ? 'bg-blue-600 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setDebtFilter('debtors')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              debtFilter === 'debtors' ? 'bg-red-600 text-white font-semibold' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Con Deuda ({clients.filter((c) => (c.totalDebt || 0) > 0).length})</span>
          </button>
          <button
            onClick={() => setDebtFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              debtFilter === 'paid' ? 'bg-emerald-600 text-white font-semibold' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Al Día ({clients.filter((c) => (c.totalDebt || 0) === 0).length})</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Cliente / Contacto</th>
                <th className="py-3 px-4">Trabajos Realizados (Autos &amp; Muebles)</th>
                <th className="py-3 px-4 text-right">Total Facturado</th>
                <th className="py-3 px-4 text-right">Saldo Adeudado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-500">
                    No hay clientes coincidentes.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const cVehicles = workOrders.filter((w) => w.clientId === client.id);
                  const cFurniture = furnitureOrders.filter((f) => f.clientId === client.id);
                  const isExpanded = expandedClientId === client.id;
                  const hasDebt = (client.totalDebt || 0) > 0;

                  return (
                    <React.Fragment key={client.id}>
                      <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{client.fullName}</div>
                          <div className="text-slate-500 flex flex-wrap items-center gap-2.5 mt-0.5">
                            <span className="flex items-center gap-1 text-slate-700 font-semibold">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {client.phone}
                            </span>
                            {client.address && (
                              <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {client.address}
                              </span>
                            )}
                            {client.email && (
                              <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {client.email}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 items-center">
                            {cVehicles.map((v) => (
                              <span key={v.id} className="font-mono text-[10px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded">
                                {v.vehiclePlate}
                              </span>
                            ))}
                            {cFurniture.map((f) => (
                              <span key={f.id} className="text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded">
                                {f.furnitureType}
                              </span>
                            ))}
                            {cVehicles.length === 0 && cFurniture.length === 0 && (
                              <span className="text-slate-400 italic">Sin trabajos aún</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          ${(client.totalSpent || 0).toLocaleString('es-AR')}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {hasDebt ? (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              ${client.totalDebt.toLocaleString('es-AR')}
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                              Al día ($0)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* WhatsApp Directo */}
                            <button
                              onClick={() =>
                                openWhatsAppModal({
                                  clientPhone: client.phone,
                                  clientName: client.fullName,
                                  itemDescription: 'Servicios de Tapicería',
                                  balanceDue: client.totalDebt || 0,
                                  defaultTemplate: (client.totalDebt || 0) > 0 ? 'debt_reminder' : 'custom',
                                })
                              }
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                              title="Enviar mensaje por WhatsApp al cliente"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setExpandedClientId(isExpanded ? null : client.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                              title="Ver historial de autos y muebles"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>

                            {/* + Auto */}
                            <button
                              onClick={() => openWorkOrderModal(null, client.id)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded"
                              title="+ Tapicería Auto"
                            >
                              <Car className="w-4 h-4" />
                            </button>

                            {/* + Mueble */}
                            <button
                              onClick={() => openFurnitureModal(null, client.id)}
                              className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-slate-100 rounded"
                              title="+ Tapicería Mueble"
                            >
                              <Armchair className="w-4 h-4" />
                            </button>

                            {/* Editar */}
                            <button
                              onClick={() => openClientModal(client)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                              title="Editar cliente"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Eliminar */}
                            <button
                              onClick={() => {
                                openConfirmModal({
                                  title: `¿Eliminar al cliente ${client.fullName}?`,
                                  message: `Se eliminará el cliente del sistema junto con el historial de sus órdenes.`,
                                  confirmLabel: 'Sí, Eliminar Cliente',
                                  danger: true,
                                  onConfirm: () => deleteClient(client.id),
                                });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded 360 Historial */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-slate-50 p-4 border-y border-slate-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Autos */}
                              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                                  <Car className="w-3.5 h-3.5 text-blue-600" />
                                  Tapicería Automotriz ({cVehicles.length})
                                </span>
                                {cVehicles.map((v) => (
                                  <div key={v.id} className="p-2 border border-slate-100 rounded flex justify-between items-center text-xs">
                                    <div>
                                      <span className="font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded text-[10px] mr-1">
                                        {v.vehiclePlate}
                                      </span>
                                      <span className="font-semibold text-slate-800">{v.vehicleModel}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">${v.totalAmount.toLocaleString('es-AR')}</span>
                                      <button
                                        onClick={() => openInvoiceModal(v)}
                                        className="text-blue-600 hover:underline text-[11px]"
                                      >
                                        Factura
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {cVehicles.length === 0 && (
                                  <p className="text-slate-400 italic text-[11px]">Sin autos tapizados para este cliente.</p>
                                )}
                              </div>

                              {/* Muebles */}
                              <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2">
                                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                                  <Armchair className="w-3.5 h-3.5 text-amber-700" />
                                  Muebles de Hogar &amp; Oficina ({cFurniture.length})
                                </span>
                                {cFurniture.map((f) => (
                                  <div key={f.id} className="p-2 border border-slate-100 rounded flex justify-between items-center text-xs">
                                    <div>
                                      <span className="font-semibold text-slate-800">{f.furnitureType}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">${f.totalAmount.toLocaleString('es-AR')}</span>
                                      <button
                                        onClick={() => openInvoiceModal(f)}
                                        className="text-blue-600 hover:underline text-[11px]"
                                      >
                                        Factura
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                {cFurniture.length === 0 && (
                                  <p className="text-slate-400 italic text-[11px]">Sin muebles tapizados para este cliente.</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

