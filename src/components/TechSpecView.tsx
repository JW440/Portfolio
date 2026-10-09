import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Layers,
  Database,
  Layout,
  GitCommit,
  CheckSquare,
  FileCode,
  Copy,
  Check,
  ArrowRight,
  Server,
  Shield,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const TechSpecView: React.FC = () => {
  const { setActiveTab, openClientModal, openWorkOrderModal, openPaymentModal } = useApp();
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [copiedCode, setCopiedCode] = useState(false);

  const sqlSchema = `-- ========================================================
-- AUTOPRO V2 / APPRO V2 SIMPLIFICADO: ESQUEMA NORMALIZADO
-- PostgreSQL 16+ / DDL Relacional 3NF para Taller Automotriz
-- ========================================================

-- 1. Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_name ON clients(full_name);

-- 2. Vehículos vinculados a Clientes
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand_model VARCHAR(100) NOT NULL,
    year_fabrication INT,
    vin_chassis VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_client ON vehicles(client_id);

-- 3. Órdenes de Servicio / Trabajos
CREATE TYPE work_order_status AS ENUM ('in_progress', 'on_hold', 'completed');

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    technical_notes TEXT NOT NULL,
    status work_order_status NOT NULL DEFAULT 'in_progress',
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    balance_due NUMERIC(12, 2) NOT NULL CHECK (balance_due >= 0),
    is_manual_balance_override BOOLEAN NOT NULL DEFAULT FALSE,
    manual_balance_reason VARCHAR(500),
    created_by_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_balance_formula CHECK (
        is_manual_balance_override = TRUE OR balance_due = (total_amount - paid_amount)
    )
);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_created ON work_orders(created_at);

-- 4. Pagos Parciales y Liquidaciones
CREATE TYPE payment_method_type AS ENUM ('cash', 'transfer', 'card', 'other');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE RESTRICT,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method payment_method_type NOT NULL DEFAULT 'transfer',
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_number VARCHAR(100),
    notes VARCHAR(500),
    recorded_by_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_order ON payments(work_order_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- 5. Pistas de Auditoría Multiusuario (Concurrencia)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT,
    performed_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_logs(created_at);`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Header */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
            <span>Documento de Arquitectura y Especificación</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Especificación Técnica APPRo v2 Automotriz</h1>
          <p className="text-sm text-slate-400 mt-1">
            Plan maestro de arquitectura, modelado de datos, wireframes y flujo crítico de usuario para CRM/ERP automotriz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg">
            Revisión 2.0 • Producción
          </span>
        </div>
      </div>

      {/* Tabs Navigation for (A) to (E) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSection('A')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'A'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>(A) Stack Tecnológico</span>
        </button>

        <button
          onClick={() => setActiveSection('B')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'B'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>(B) Estructura DB Normalizada</span>
        </button>

        <button
          onClick={() => setActiveSection('C')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'C'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>(C) Wireframes 5 Pantallas</span>
        </button>

        <button
          onClick={() => setActiveSection('D')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'D'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>(D) Flujo de Caso de Uso Crítico</span>
        </button>

        <button
          onClick={() => setActiveSection('E')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeSection === 'E'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>(E) Checklist MVP vs. Fases</span>
        </button>
      </div>

      {/* SECTION (A): STACK TECNOLÓGICO */}
      {activeSection === 'A' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>(A) Especificación de Stack Tecnológico Recomendado</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para garantizar una plataforma CRM/ERP ultra rápida, intuitiva, con concurrencia multiusuario sin fricción y costos operativos óptimos para talleres automotrices, se selecciona una arquitectura web moderna full-stack:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {/* Frontend Layer */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">1. Frontend Web SPA</span>
                <h3 className="font-bold text-slate-900 text-sm">React 19 + TypeScript + Tailwind CSS</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Paleta de colores planos:</strong> Azul naval (#1e40af / #2563eb), slate y blanco puro estilo APPRo v2.</li>
                  <li><strong>Diseño minimalista:</strong> Sin sombras excesivas ni elementos superfluos; foco en captura de datos numéricos y patentes.</li>
                  <li><strong>Componentes modulares:</strong> Tablas reactivas, modales de abono rápido, y vista de impresión de reportes en CSS print.</li>
                </ul>
              </div>

              {/* Backend & Concurrency */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">2. Backend &amp; Servidor</span>
                <h3 className="font-bold text-slate-900 text-sm">Node.js + Express / Vite API Proxy</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Endpoints seguros:</strong> Enrutamiento proxy para consultas y lógica de auditoría sin exponer claves.</li>
                  <li><strong>Acceso concurrente:</strong> Sesiones concurrentes en tiempo real para asesores, mecánicos y cajeros.</li>
                  <li><strong>Cálculo transaccional:</strong> Verificación de fórmulas de saldo en backend y guardas de integridad.</li>
                </ul>
              </div>

              {/* Persistence Layer */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">3. Persistencia de Datos</span>
                <h3 className="font-bold text-slate-900 text-sm">Firebase Firestore + PostgreSQL Compatible</h3>
                <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                  <li><strong>Sincronización en vivo:</strong> Listeners reactivos (onSnapshot) para que cuando un cajero registre un pago, el asesor lo vea al instante.</li>
                  <li><strong>Reglas ABAC de Seguridad:</strong> Reglas estrictas en Firestore y validación de tipos y tamaños.</li>
                  <li><strong>Mapeo relacional:</strong> Estructura normalizada convertible directamente a PostgreSQL/SQL relacional.</li>
                </ul>
              </div>

              {/* Auth Layer */}
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">4. Autenticación &amp; RBAC</span>
                <h3 className="font-bold text-slate-900 text-sm">Firebase Authentication (Google Sign-In)</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Acceso seguro sin contraseñas débiles:</strong> Google Identity con tokens criptográficos verificados.</li>
                  <li><strong>Mismos permisos para el equipo:</strong> Conducción simétrica y trazabilidad en logs de auditoría por usuario.</li>
                </ul>
              </div>

              {/* Calendar & Workshop Layer */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">5. Calendario &amp; Gestión de Muebles</span>
                <h3 className="font-bold text-slate-900 text-sm">Calendario de Entregas y Sección Muebles</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Cronograma visual:</strong> Vista mensual con entregas programadas de vehículos y muebles.</li>
                  <li><strong>Apartado dedicado:</strong> Gestión especializada para sofás, sillones, sillas y respaldos.</li>
                  <li><strong>Enfoque conciso:</strong> Observaciones técnicas directas sin IA ni pasos redundantes.</li>
                </ul>
              </div>

              {/* Reporting & PDF */}
              <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">6. Motor de Reportes &amp; PDF</span>
                <h3 className="font-bold text-slate-900 text-sm">Vector Print CSS + Exportación Tabular</h3>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Salida nativa A4:</strong> Sin distorsión ni marcas de agua en cualquier navegador o dispositivo.</li>
                  <li><strong>Exportación CSV:</strong> Descarga instantánea compatible con Excel para contabilidad externa.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION (B): ESTRUCTURA DE BASE DE DATOS NORMALIZADA */}
      {activeSection === 'B' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span>(B) Estructura de Base de Datos Normalizada (3NF &amp; NoSQL Mapped)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Tablas, campos, tipos de datos, llaves primarias/foráneas y restricciones de integridad financiera.
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(sqlSchema)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar DDL SQL'}</span>
              </button>
            </div>

            {/* Entity Relationship Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <strong className="text-slate-900 block font-bold">1. CLIENTES (clients)</strong>
                <span className="text-slate-500">PK: id (UUID/String)</span>
                <p className="text-[11px] text-slate-600 mt-1">Nombre completo, teléfono, email, notas, timestamps.</p>
                <span className="inline-block mt-2 text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                  Relación: 1:N con work_orders
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <strong className="text-slate-900 block font-bold">2. ÓRDENES (work_orders)</strong>
                <span className="text-slate-500">PK: id • FK: client_id</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Patente, modelo, observaciones técnicas, estado, total, pagado, saldo, flags manuales.
                </p>
                <span className="inline-block mt-2 text-[10px] bg-purple-100 text-purple-800 font-semibold px-1.5 py-0.5 rounded">
                  Relación: 1:N con payments
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <strong className="text-slate-900 block font-bold">3. PAGOS (payments)</strong>
                <span className="text-slate-500">PK: id • FK: work_order_id, client_id</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Monto, medio (efectivo/transferencia/tarjeta), fecha, referencia, usuario cajero.
                </p>
                <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                  Audit trail de caja
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <strong className="text-slate-900 block font-bold">4. AUDITORÍA (audit_logs)</strong>
                <span className="text-slate-500">PK: id (Inmutable)</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Acción, tipo de entidad, ID, detalle, usuario ejecutor, timestamp UTC.
                </p>
                <span className="inline-block mt-2 text-[10px] bg-slate-200 text-slate-800 font-semibold px-1.5 py-0.5 rounded">
                  Concurrencia segura
                </span>
              </div>
            </div>

            {/* DDL Code Box */}
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono p-4 max-h-96 overflow-y-auto">
              <pre>{sqlSchema}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION (C): WIREFRAMES DE LAS 5 PANTALLAS PRINCIPALES */}
      {activeSection === 'C' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-600" />
              <span>(C) Wireframes Funcionales y Arquitectura de las 5 Pantallas Principales</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Esquemas visuales y distribución funcional con paleta azul naval/blanco y flujos ultra concisos inspirados en APPRo v2:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Screen 1: Dashboard */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Pantalla 1: Dashboard Ejecutivo</span>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Probar Pantalla →
                  </button>
                </div>
                {/* Wireframe Mockup */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                  <div className="h-6 bg-slate-800 rounded flex items-center px-2 text-white font-mono text-[9px]">
                    [TOP BAR] Logo AutoPro v2 | KPIs Rápidos | Botón Cobrar Abono | Botón Nueva Orden
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <div className="bg-amber-50 border border-amber-200 p-1.5 rounded text-center font-bold text-amber-800">
                      Clientes con Deuda
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-1.5 rounded text-center font-bold text-blue-800">
                      Trabajos en Taller
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded text-center font-bold text-emerald-800">
                      Ingresos del Mes
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-1.5 rounded text-center font-bold text-purple-800">
                      Total Clientes
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2 bg-slate-50 border border-slate-200 p-2 rounded">
                      <span className="font-bold block">[LISTA] Órdenes en Progreso con Patente y Saldo</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded">
                      <span className="font-bold block">[SIDEBAR] Deudores Críticos &amp; Top Clientes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen 2: Directorio de Clientes */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Pantalla 2: Directorio &amp; Historial 360 Clientes</span>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Probar Pantalla →
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <div className="h-6 flex-1 bg-slate-100 border border-slate-200 rounded px-2 text-[9px] flex items-center">
                      🔍 Buscador Reactivo (Nombre / Teléfono / Patente)
                    </div>
                    <div className="h-6 w-24 bg-blue-600 text-white rounded text-[9px] flex items-center justify-center font-bold">
                      + Nuevo Cliente
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-1.5 space-y-1">
                    <div className="bg-slate-100 p-1 text-[9px] font-bold grid grid-cols-5">
                      <span>Cliente/Tel</span>
                      <span>Vehículos</span>
                      <span>Total Facturado</span>
                      <span>Pagado</span>
                      <span>Saldo Adeudado</span>
                    </div>
                    <div className="p-1 border-t border-slate-100 text-[9px] grid grid-cols-5 bg-red-50/50">
                      <span>Roberto Sánchez</span>
                      <span>[AE 412 KL]</span>
                      <span>$450.000</span>
                      <span>$330.000</span>
                      <span className="font-bold text-red-700">$120.000 (Debe)</span>
                    </div>
                  </div>
                  <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-[9px] text-blue-800">
                    [DRAWER EXPANDIBLE]: Historial completo de trabajos realizados + Fechas y montos de pagos recibidos.
                  </div>
                </div>
              </div>

              {/* Screen 3: Órdenes de Trabajo */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Pantalla 3: Órdenes de Trabajo &amp; Patentes</span>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Probar Pantalla →
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1">
                    <div className="h-6 flex-1 bg-slate-100 border border-slate-200 rounded px-2 text-[9px] flex items-center">
                      Filtros: Patente | Estado (En Progreso / En Espera / Completado) | Rango Fechas
                    </div>
                    <div className="h-6 w-24 bg-blue-600 text-white rounded text-[9px] flex items-center justify-center font-bold">
                      + Nueva Orden
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded p-1.5 space-y-1">
                    <div className="p-1.5 border border-slate-100 rounded flex justify-between items-center bg-slate-50 text-[9px]">
                      <div>
                        <span className="font-black bg-black text-white px-1.5 py-0.5 rounded mr-1">AE 412 KL</span>
                        <strong className="text-slate-800">Toyota Hilux 2.8 TDI</strong>
                        <p className="text-slate-500">Service 50k km, cambio aceite y frenos</p>
                      </div>
                      <div className="text-right">
                        <span>Total: $320.000</span> | <strong className="text-red-700">Debe: $120.000</strong>
                        <div className="text-[8px] text-blue-700">[Botón Cobrar Abono] [Imprimir PDF]</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen 4: Pagos Parciales & Cobranzas */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Pantalla 4: Terminal de Cobros y Pagos Parciales</span>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Probar Pantalla →
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-center font-bold">
                    <div className="bg-slate-100 p-1 rounded">Total Recaudado</div>
                    <div className="bg-blue-50 p-1 rounded">Transferencias</div>
                    <div className="bg-emerald-50 p-1 rounded">Efectivo Caja</div>
                  </div>
                  <div className="border border-slate-200 rounded p-1.5 space-y-1 text-[9px]">
                    <div className="bg-slate-100 p-1 font-bold grid grid-cols-6">
                      <span>Fecha</span>
                      <span>Comprobante</span>
                      <span>Cliente</span>
                      <span>Patente</span>
                      <span>Monto</span>
                      <span>Cajero</span>
                    </div>
                    <div className="p-1 border-t border-slate-100 grid grid-cols-6">
                      <span>05/10/2026</span>
                      <span>TRF-984421</span>
                      <span>R. Sánchez</span>
                      <span>AE 412 KL</span>
                      <span className="font-bold text-emerald-700">$200.000</span>
                      <span>Carlos M.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen 5: Reportes y PDF */}
              <div className="col-span-1 md:col-span-2 p-4 rounded-xl border border-slate-300 bg-slate-50/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-900">Pantalla 5: Centro de Reportes &amp; Exportación PDF</span>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Probar Pantalla →
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="px-2 py-1 bg-blue-600 text-white rounded text-[9px] font-bold">1. Estado de Cuenta Cliente</div>
                    <div className="px-2 py-1 bg-slate-100 rounded text-[9px]">2. Orden de Taller</div>
                    <div className="px-2 py-1 bg-slate-100 rounded text-[9px]">3. Cartera de Deudores</div>
                    <div className="px-2 py-1 bg-slate-100 rounded text-[9px]">4. Balance Caja</div>
                    <div className="ml-auto h-6 px-3 bg-slate-800 text-white rounded text-[9px] flex items-center font-bold">
                      🖨️ Imprimir / Guardar PDF
                    </div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded text-center text-slate-500 text-[10px] bg-slate-50">
                    [VISTA PREVIA EN FORMATO A4 LISTA PARA IMPRESIÓN OFICIAL CON CABECERA DEL TALLER Y COMPROBANTES]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION (D): FLUJO DE USUARIO PARA CASO DE USO CRÍTICO */}
      {activeSection === 'D' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-blue-600" />
              <span>(D) Diagrama de Flujo del Caso de Uso Crítico (Paso a Paso)</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              El flujo crítico empresarial exigido: <strong>Crear Cliente → Registrar Trabajo → Registrar Pago Parcial → Generar Reporte</strong>, diseñado con recálculo automático de saldos y trazabilidad:
            </p>

            {/* Interactive Step-by-Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              {/* Step 1 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2 relative">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Crear Cliente</h3>
                <p className="text-xs text-slate-600">
                  Asesor de servicio ingresa Nombre Completo, Teléfono móvil y correo. Se valida que el cliente no esté duplicado.
                </p>
                <div className="text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded border border-blue-100">
                  totalSpent: $0<br />
                  totalDebt: $0
                </div>
                <button
                  onClick={() => openClientModal(null)}
                  className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                >
                  Ejecutar Paso 1
                </button>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Registrar Trabajo</h3>
                <p className="text-xs text-slate-600">
                  Se asocia al cliente. Se captura Patente (placa) o Mueble, Modelo, Observaciones técnicas de tapicería y Monto Total ($).
                </p>
                <div className="text-[10px] text-slate-500 font-mono bg-white p-1.5 rounded border border-slate-200">
                  paidAmount = 0<br />
                  balanceDue = totalAmount (Auto)
                </div>
                <button
                  onClick={() => openWorkOrderModal(null)}
                  className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-semibold"
                >
                  Ejecutar Paso 2
                </button>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Registrar Pago Parcial</h3>
                <p className="text-xs text-slate-600">
                  Cajero registra abono (ej. 50% de seña). El sistema recalcula en tiempo real el saldo adeudado y actualiza la deuda del cliente.
                </p>
                <div className="text-[10px] text-emerald-800 font-mono bg-white p-1.5 rounded border border-emerald-200">
                  nuevoSaldo = total - abono<br />
                  status: in_progress
                </div>
                <button
                  onClick={() => openPaymentModal(null)}
                  className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                >
                  Ejecutar Paso 3
                </button>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <h3 className="font-bold text-slate-900 text-sm">Generar Factura o Reporte PDF</h3>
                <p className="text-xs text-slate-600">
                  Se emite la Factura oficial de tapicería o el Estado de Cuenta del cliente con el historial, saldo remanente y firmas.
                </p>
                <div className="text-[10px] text-purple-800 font-mono bg-white p-1.5 rounded border border-purple-200">
                  Formato A4 Limpio<br />
                  Listo para imprimir o descargar en PDF
                </div>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="w-full mt-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
                >
                  Ver Facturación PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION (E): CHECKLIST MVP VS. FUTURAS FASES */}
      {activeSection === 'E' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span>(E) Checklist de Características: MVP Actual vs. Futuras Fases (Estilo APPRo v2)</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Matriz de alcance funcional que compara la entrega inmediata lista para operar frente a la hoja de ruta de ampliación:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Col 1: MVP Completado */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                  <span className="font-bold text-sm text-emerald-900">✅ FASE 1: MVP Funcional Entregado</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    100% Operativo
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Gestión de Clientes:</strong> Alta, edición, teléfono, historial completo 360 de órdenes y pagos.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Órdenes por Patente:</strong> Placa, modelo, observaciones técnicas, fechas de inicio y fin.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Recálculo Automático de Saldo:</strong> saldo = total - pagos, con override manual justificado.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Pagos Parciales:</strong> Registro de abonos por efectivo, transferencia, tarjeta, comprobante.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Búsqueda &amp; Filtros Multicriterio:</strong> Por patente, cliente, modelo, estado y fechas.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Dashboard Ejecutivo:</strong> KPIs de morosos, vehículos en taller, ingresos mes, ranking top.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Exportación PDF:</strong> Estado de cuenta cliente, orden de taller, cartera deudores, balance caja.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Concurrencia Multiusuario:</strong> Sincronización en vivo Firebase + Switcher de equipo.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✔</span>
                    <span><strong>Calendario &amp; Apartado Muebles:</strong> Cronograma de entregas, sección dedicada a muebles del hogar y emisión de facturas en PDF.</span>
                  </div>
                </div>
              </div>

              {/* Col 2: Futuras Fases */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-800">🚀 FASE 2 &amp; 3: Roadmap Futuro</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    Siguientes Fases
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">⏳</span>
                    <span><strong>Módulo de Inventario de Repuestos:</strong> Stock de filtros, aceites y piezas vinculados al costo de la orden.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">⏳</span>
                    <span><strong>Integración WhatsApp Webhooks / Bot:</strong> Envío automático de presupuestos aprobables por chat.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">⏳</span>
                    <span><strong>Facturación Electrónica Fiscal (AFIP / SAT):</strong> Emisión automática de comprobantes A/B/C.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">⏳</span>
                    <span><strong>Multi-Sucursal &amp; Talleres Franquiciados:</strong> Aislamiento de inventario y balances por taller.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">⏳</span>
                    <span><strong>Portal Web de Seguimiento para el Cliente:</strong> Consulta del estado del auto mediante la patente.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
