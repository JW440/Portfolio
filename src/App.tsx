/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { FurnitureView } from './components/FurnitureView';
import { ClientsView } from './components/ClientsView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { TechSpecView } from './components/TechSpecView';
import { ClientModal } from './components/ClientModal';
import { WorkOrderModal } from './components/WorkOrderModal';
import { FurnitureModal } from './components/FurnitureModal';
import { PaymentModal } from './components/PaymentModal';
import { InvoiceModal } from './components/InvoiceModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { ConfirmModal } from './components/ConfirmModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'vehicles' && <WorkOrdersView />}
      {activeTab === 'furniture' && <FurnitureView />}
      {activeTab === 'clients' && <ClientsView />}
      {activeTab === 'payments' && <PaymentsView />}
      {activeTab === 'invoices' && <ReportsView />}
      {activeTab === 'specs' && <TechSpecView />}

      {/* Global Modals */}
      <ClientModal />
      <WorkOrderModal />
      <FurnitureModal />
      <PaymentModal />
      <InvoiceModal />
      <WhatsAppModal />
      <ConfirmModal />
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Minimal Footer */}
        <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-xs text-slate-500 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Gestión de Clientes</span>
              <span className="text-slate-300">•</span>
              <span>Órdenes, Vehículos &amp; Muebles</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Calendario de Entregas</span>
              <span>•</span>
              <span>Facturación en PDF</span>
              <span>•</span>
              <span>Saldos Verificables</span>
            </div>
          </div>
        </footer>
      </div>
    </AppProvider>
  );
}
