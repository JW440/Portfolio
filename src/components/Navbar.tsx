import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Car,
  Armchair,
  Users,
  CreditCard,
  Receipt,
  FileCode,
  Plus,
  LogIn,
  LogOut,
  RotateCcw,
  Search,
  X,
  ChevronRight,
  Briefcase,
  UserPlus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    teamMembers,
    setCurrentUser,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    workOrders,
    furnitureOrders,
    clients,
    openWorkOrderModal,
    openFurnitureModal,
    openClientModal,
    isFirebaseUser,
    handleGoogleLogin,
    handleGoogleLogout,
    resetToDemoSeed,
    openConfirmModal,
    databaseId,
    syncStatus,
    lastSyncTime,
    syncWithFirestore,
  } = useApp();

  const [globalSearch, setGlobalSearch] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [puestosModalOpen, setPuestosModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRoleValue, setEditRoleValue] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanQuery = globalSearch.toLowerCase().trim();

  const matchingVehicles = cleanQuery
    ? workOrders.filter(
        (w) =>
          w.vehiclePlate.toLowerCase().includes(cleanQuery) ||
          w.vehicleModel.toLowerCase().includes(cleanQuery) ||
          w.clientName.toLowerCase().includes(cleanQuery) ||
          w.technicalNotes.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingFurniture = cleanQuery
    ? furnitureOrders.filter(
        (f) =>
          f.furnitureType.toLowerCase().includes(cleanQuery) ||
          f.clientName.toLowerCase().includes(cleanQuery) ||
          f.observations.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchingClients = cleanQuery
    ? clients.filter(
        (c) =>
          c.fullName.toLowerCase().includes(cleanQuery) ||
          c.phone.toLowerCase().includes(cleanQuery) ||
          (c.email && c.email.toLowerCase().includes(cleanQuery))
      )
    : [];

  const totalResultsCount = matchingVehicles.length + matchingFurniture.length + matchingClients.length;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-slate-200">Gestión de clientes</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Directorio, Órdenes &amp; Entregas</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          {/* Firestore indicator */}
          <div className="flex items-center gap-1.5 text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span className="text-slate-300 font-mono">Firestore</span>
            {syncStatus === 'syncing' ? (
              <span className="text-amber-400 font-semibold animate-pulse">(Sincronizando...)</span>
            ) : syncStatus === 'synced' ? (
              <span className="text-emerald-400">({lastSyncTime || 'En vivo'})</span>
            ) : (
              <span className="text-slate-400">(Conectado)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => syncWithFirestore()}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            title="Sincronizar lectura y escritura con Firestore"
          >
            <RotateCcw className={`w-3 h-3 text-blue-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>Sincronizar DB</span>
          </button>

          {/* Team Switcher & Puestos Management */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden md:inline">Usuario:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = teamMembers.find((m) => m.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
              className="bg-slate-800 text-white text-xs px-2 py-0.5 rounded border border-slate-700 cursor-pointer focus:outline-none"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>

            {/* Button to open Puestos manager */}
            <button
              onClick={() => setPuestosModalOpen(true)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded text-[11px] border border-slate-700 transition-colors"
              title="Administrar Puestos de Trabajo y Personal"
            >
              <Briefcase className="w-3 h-3 text-amber-400" />
              <span>+ Puestos</span>
            </button>
          </div>

          {/* Google Auth Status */}
          {isFirebaseUser ? (
            <button
              onClick={handleGoogleLogout}
              className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-xs transition-colors"
              title="Cerrar sesión de Google"
            >
              <LogOut className="w-3 h-3 text-red-400" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1 text-blue-300 hover:text-white bg-blue-950 hover:bg-blue-900 px-2.5 py-0.5 rounded text-xs border border-blue-800 transition-colors"
            >
              <LogIn className="w-3 h-3 text-blue-400" />
              <span>Conectar Google</span>
            </button>
          )}

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              openConfirmModal({
                title: '¿Restablecer datos de prueba?',
                message: 'Se reiniciarán los datos a los valores predeterminados de ejemplo.',
                confirmLabel: 'Restablecer',
                danger: true,
                onConfirm: () => resetToDemoSeed(),
              });
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 px-1.5 py-0.5 rounded transition-colors text-xs"
            title="Restablecer datos demo"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-black">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">Gestión de clientes</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Órdenes, Vehículos &amp; Muebles • Entregas &amp; Facturas</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'calendar' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Calendario Entregas</span>
          </button>

          <button
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'vehicles' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Órdenes Autos</span>
          </button>

          <button
            onClick={() => setActiveTab('furniture')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'furniture' ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Armchair className="w-4 h-4 text-amber-700" />
            <span>Órdenes Muebles</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'clients' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'payments' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cobranzas</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'invoices' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Facturas PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-slate-200 transition-all ${
              activeTab === 'specs' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Blueprint (A-E)</span>
          </button>
        </nav>

        {/* Global Search Bar (Omnibox across Vehicles, Furniture & Clients) */}
        <div ref={searchContainerRef} className="relative hidden lg:block w-64 xl:w-72">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar patente, mueble o cliente..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            />
            {globalSearch && (
              <button
                onClick={() => {
                  setGlobalSearch('');
                  setShowResults(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Floating Dropdown Results */}
          {showResults && globalSearch.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
              <div className="p-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">
                  {totalResultsCount} {totalResultsCount === 1 ? 'resultado' : 'resultados'}
                </span>
                <span className="text-[10px] text-slate-400">Clic para abrir</span>
              </div>

              {totalResultsCount === 0 ? (
                <div className="p-4 text-center text-slate-500 text-xs">
                  No se encontraron coincidencias para "{globalSearch}"
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Vehículos */}
                  {matchingVehicles.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 px-1.5 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        <span>Autos ({matchingVehicles.length})</span>
                      </div>
                      {matchingVehicles.slice(0, 4).map((v) => (
                        <div
                          key={v.id}
                          onClick={() => {
                            setActiveTab('vehicles');
                            openWorkOrderModal(v);
                            setShowResults(false);
                          }}
                          className="p-1.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-1.5 py-0.2 rounded">
                                {v.vehiclePlate}
                              </span>
                              <span className="font-semibold text-slate-800">{v.vehicleModel}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{v.clientName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">${v.totalAmount.toLocaleString('es-AR')}</span>
                            {v.balanceDue > 0 ? (
                              <span className="text-[10px] text-red-600 font-semibold">Debe ${v.balanceDue.toLocaleString('es-AR')}</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-medium">Cancelado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Muebles */}
                  {matchingFurniture.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-1.5 flex items-center gap-1">
                        <Armchair className="w-3 h-3" />
                        <span>Muebles ({matchingFurniture.length})</span>
                      </div>
                      {matchingFurniture.slice(0, 4).map((f) => (
                        <div
                          key={f.id}
                          onClick={() => {
                            setActiveTab('furniture');
                            openFurnitureModal(f);
                            setShowResults(false);
                          }}
                          className="p-1.5 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{f.furnitureType}</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{f.clientName}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">${f.totalAmount.toLocaleString('es-AR')}</span>
                            {f.balanceDue > 0 ? (
                              <span className="text-[10px] text-red-600 font-semibold">Debe ${f.balanceDue.toLocaleString('es-AR')}</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 font-medium">Cancelado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Clientes */}
                  {matchingClients.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600 px-1.5 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Clientes ({matchingClients.length})</span>
                      </div>
                      {matchingClients.slice(0, 3).map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setActiveTab('clients');
                            openClientModal(c);
                            setShowResults(false);
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{c.fullName}</span>
                            <span className="text-[11px] text-slate-500 block">{c.phone}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setActiveTab('clients');
              openClientModal(null);
            }}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-md text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition-colors"
            title="Alta de Nuevo Cliente"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>+ Cliente</span>
          </button>

          <button
            onClick={() => openFurnitureModal(null)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-md text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-2xs transition-colors"
            title="Nuevo Trabajo de Mueble"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Mueble</span>
          </button>

          <button
            onClick={() => openWorkOrderModal(null)}
            className="flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
            title="Nueva Tapicería de Auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Auto</span>
          </button>
        </div>
      </div>

      {/* Mobile Bar */}
      <div className="xl:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Calendario
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'vehicles' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Autos
        </button>
        <button
          onClick={() => setActiveTab('furniture')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'furniture' ? 'bg-amber-700 text-white' : 'text-slate-600'}`}
        >
          Muebles
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Clientes
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'payments' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Cobranzas
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-2 py-1 rounded font-medium ${activeTab === 'invoices' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
        >
          Facturas
        </button>
      </div>

      {/* Puestos & Team Management Modal */}
      {puestosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Gestión de Puestos &amp; Equipo</h3>
                  <p className="text-xs text-slate-500">
                    Crea y personaliza los puestos de trabajo del personal del taller según tus necesidades.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPuestosModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Puesto Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newMemberName.trim() || !newMemberRole.trim()) return;
                addTeamMember(newMemberName.trim(), newMemberRole.trim());
                setNewMemberName('');
                setNewMemberRole('');
              }}
              className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3 space-y-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <UserPlus className="w-3.5 h-3.5 text-amber-700" />
                <span>Agregar Nuevo Puesto / Integrante</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre del Colaborador (ej. Martín Sosa)"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-amber-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Puesto / Cargo (ej. Encargado, Vendedor...)"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-amber-300/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Puesto</span>
                </button>
              </div>
            </form>

            {/* List of current puestos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">Puestos y Usuarios Registrados:</h4>
              <div className="max-h-60 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{member.name}</span>
                        {currentUser.id === member.id && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                            Activo
                          </span>
                        )}
                      </div>

                      {editingMemberId === member.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="text"
                            value={editRoleValue}
                            onChange={(e) => setEditRoleValue(e.target.value)}
                            className="px-2 py-0.5 text-xs border border-slate-300 rounded font-medium focus:outline-none"
                            placeholder="Nuevo puesto..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (editRoleValue.trim()) {
                                updateTeamMember(member.id, { role: editRoleValue.trim() });
                              }
                              setEditingMemberId(null);
                            }}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Guardar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMemberId(null)}
                            className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          Puesto: <span className="text-amber-800 font-semibold">{member.role}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {currentUser.id !== member.id && (
                        <button
                          type="button"
                          onClick={() => setCurrentUser(member)}
                          className="px-2 py-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 rounded font-semibold transition-colors"
                        >
                          Usar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setEditRoleValue(member.role);
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        title="Editar puesto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            openConfirmModal({
                              title: `¿Eliminar puesto de ${member.name}?`,
                              message: `Se eliminará el puesto (${member.role}) de la lista de colaboradores.`,
                              confirmLabel: 'Eliminar Puesto',
                              danger: true,
                              onConfirm: () => deleteTeamMember(member.id),
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar puesto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPuestosModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
