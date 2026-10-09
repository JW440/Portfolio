import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, WorkOrder, FurnitureOrder, Payment, AuditLog, TeamMember } from '../types';
import { db, auth, loginWithGoogle, logoutUser, handleFirestoreError, OperationType, testConnection } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';

export interface ConfirmModalData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export interface AppContextType {
  // State
  clients: Client[];
  workOrders: WorkOrder[];
  furnitureOrders: FurnitureOrder[];
  payments: Payment[];
  auditLogs: AuditLog[];
  currentUser: TeamMember;
  teamMembers: TeamMember[];
  setCurrentUser: (member: TeamMember) => void;
  activeTab: 'dashboard' | 'calendar' | 'vehicles' | 'furniture' | 'clients' | 'payments' | 'invoices' | 'specs';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'vehicles' | 'furniture' | 'clients' | 'payments' | 'invoices' | 'specs') => void;

  // Firestore status
  isFirebaseConnected: boolean;
  isFirebaseUser: boolean;
  firebaseAuthUser: any;
  databaseId: string;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: string | null;
  syncWithFirestore: () => Promise<void>;

  // CRUD: Clientes
  createClient: (clientData: Omit<Client, 'id' | 'totalSpent' | 'totalDebt' | 'createdAt'>) => Promise<string>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  addClient: (clientData: Omit<Client, 'id' | 'totalSpent' | 'totalDebt' | 'createdAt'>) => Promise<string>;

  // CRUD: Tapicería Automotriz (Vehículos / Patentes)
  createWorkOrder: (orderData: Omit<WorkOrder, 'id' | 'paidAmount' | 'balanceDue' | 'createdAt'> & { customBalance?: number }) => Promise<string>;
  updateWorkOrder: (id: string, orderData: Partial<WorkOrder>) => Promise<void>;
  deleteWorkOrder: (id: string) => Promise<void>;
  getWorkOrderById: (id: string) => WorkOrder | undefined;
  addWorkOrder: (orderData: Omit<WorkOrder, 'id' | 'paidAmount' | 'balanceDue' | 'createdAt'> & { customBalance?: number }) => Promise<string>;

  // CRUD: Apartado Muebles & Hogar
  createFurnitureOrder: (orderData: Omit<FurnitureOrder, 'id' | 'paidAmount' | 'balanceDue' | 'createdAt'> & { customBalance?: number }) => Promise<string>;
  updateFurnitureOrder: (id: string, orderData: Partial<FurnitureOrder>) => Promise<void>;
  deleteFurnitureOrder: (id: string) => Promise<void>;
  getFurnitureOrderById: (id: string) => FurnitureOrder | undefined;

  // Pagos y Cobranzas
  addPayment: (paymentData: Omit<Payment, 'id' | 'createdAt'>) => Promise<string>;
  deletePayment: (id: string) => Promise<void>;

  // Modales
  modalState: {
    clientModalOpen: boolean;
    selectedClient: Client | null;
    workOrderModalOpen: boolean;
    selectedWorkOrder: WorkOrder | null;
    furnitureModalOpen: boolean;
    selectedFurnitureOrder: FurnitureOrder | null;
    paymentModalOpen: boolean;
    paymentTarget: { id: string; type: 'vehicle' | 'furniture'; balanceDue: number; clientName: string; description: string } | null;
    invoiceModalOpen: boolean;
    invoiceData: any;
    whatsappModalOpen: boolean;
    whatsappData: {
      clientPhone: string;
      clientName: string;
      itemDescription: string;
      statusText?: string;
      totalAmount?: number;
      paidAmount?: number;
      balanceDue?: number;
      deliveryDate?: string;
      notes?: string;
      invoiceNumber?: string;
      defaultTemplate?: 'ready' | 'in_progress' | 'debt_reminder' | 'invoice' | 'custom';
    } | null;
    confirmModalOpen: boolean;
    confirmModalData: ConfirmModalData | null;
  };
  openClientModal: (client?: Client | null) => void;
  closeClientModal: () => void;
  openWorkOrderModal: (order?: WorkOrder | null, preselectedClientId?: string) => void;
  closeWorkOrderModal: () => void;
  openFurnitureModal: (order?: FurnitureOrder | null, preselectedClientId?: string) => void;
  closeFurnitureModal: () => void;
  openPaymentModal: (target?: { id: string; type: 'vehicle' | 'furniture'; balanceDue: number; clientName: string; description: string } | null) => void;
  closePaymentModal: () => void;
  openInvoiceModal: (data: any) => void;
  closeInvoiceModal: () => void;
  openWhatsAppModal: (data: {
    clientPhone: string;
    clientName: string;
    itemDescription: string;
    statusText?: string;
    totalAmount?: number;
    paidAmount?: number;
    balanceDue?: number;
    deliveryDate?: string;
    notes?: string;
    invoiceNumber?: string;
    defaultTemplate?: 'ready' | 'in_progress' | 'debt_reminder' | 'invoice' | 'custom';
  }) => void;
  closeWhatsAppModal: () => void;
  openConfirmModal: (data: ConfirmModalData) => void;
  closeConfirmModal: () => void;

  // Puestos y Miembros del Equipo
  addTeamMember: (name: string, role: string, email?: string) => Promise<string>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;

  // Auth & Reset
  handleGoogleLogin: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  resetToDemoSeed: () => void;
}

const DEFAULT_TEAM: TeamMember[] = [
  { id: 'usr-1', name: 'Bruno Fierro', email: 'brunosfierro08@gmail.com', role: 'Administrador' },
];

const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-101',
    fullName: 'Roberto Alejandro Sánchez',
    phone: '+54 9 11 4589-2310',
    email: 'roberto.sanchez@gmail.com',
    notes: 'Tapizado de butacas y paneles cuero ecológico.',
    totalSpent: 420000,
    totalDebt: 120000,
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'cli-102',
    fullName: 'Estudio de Arquitectura & Diseño Sur',
    phone: '+54 9 11 6321-8890',
    email: 'estudiosur@diseno.com.ar',
    notes: 'Cuenta corriente muebles de oficina y sillones para recepción.',
    totalSpent: 850000,
    totalDebt: 280000,
    createdAt: '2026-09-25T14:00:00Z',
  },
  {
    id: 'cli-103',
    fullName: 'Mariana Victoria Gómez',
    phone: '+54 9 11 5112-9904',
    email: 'mariana.gomez@yahoo.com',
    notes: 'Juego de comedor clásico 6 sillas.',
    totalSpent: 260000,
    totalDebt: 0,
    createdAt: '2026-10-03T09:00:00Z',
  },
  {
    id: 'cli-104',
    fullName: 'Agustín Facundo Pereyra',
    phone: '+54 9 11 3204-7711',
    email: 'agustin.pereyra@outlook.com',
    notes: 'Tapicería butacas Hilux reforzado para campo.',
    totalSpent: 310000,
    totalDebt: 90000,
    createdAt: '2026-10-04T11:00:00Z',
  },
];

const INITIAL_VEHICLE_ORDERS: WorkOrder[] = [
  {
    id: 'wo-201',
    clientId: 'cli-101',
    clientName: 'Roberto Alejandro Sánchez',
    vehiclePlate: 'AE 412 KL',
    vehicleModel: 'Toyota Hilux 2021',
    technicalNotes: 'Tapizado completo de 2 butacas delanteras en cuero ecológico negro con costura doble gris. Relleno nuevo en riñoneras.',
    status: 'in_progress',
    totalAmount: 320000,
    paidAmount: 200000,
    balanceDue: 120000,
    deliveryDate: '2026-10-12',
    isManualBalanceOverride: false,
    createdAt: '2026-10-05T08:30:00Z',
  },
  {
    id: 'wo-202',
    clientId: 'cli-104',
    clientName: 'Agustín Facundo Pereyra',
    vehiclePlate: 'AD 553 OX',
    vehicleModel: 'Chevrolet Cruze 2020',
    technicalNotes: 'Retapizado de volante en cuero microperforado y cambio de tela de techo descolgada en tela gris claro original.',
    status: 'in_progress',
    totalAmount: 180000,
    paidAmount: 90000,
    balanceDue: 90000,
    deliveryDate: '2026-10-14',
    isManualBalanceOverride: false,
    createdAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'wo-203',
    clientId: 'cli-101',
    clientName: 'Roberto Alejandro Sánchez',
    vehiclePlate: 'AF 709 ZZ',
    vehicleModel: 'Volkswagen Vento 2018',
    technicalNotes: 'Reparación de funda trasera y apoyabrazos central en tela jacquard.',
    status: 'completed',
    totalAmount: 100000,
    paidAmount: 100000,
    balanceDue: 0,
    deliveryDate: '2026-10-08',
    isManualBalanceOverride: false,
    createdAt: '2026-10-02T09:00:00Z',
    completedAt: '2026-10-08T16:00:00Z',
  },
];

const INITIAL_FURNITURE_ORDERS: FurnitureOrder[] = [
  {
    id: 'fur-301',
    clientId: 'cli-102',
    clientName: 'Estudio de Arquitectura & Diseño Sur',
    furnitureType: 'Sofá Chesterfield 3 Cuerpos',
    observations: 'Retapizado en pana antimanchas color verde esmeralda con capitoné profundo, botones forrados y cambio de cinchas elásticas italianas.',
    status: 'in_progress',
    totalAmount: 580000,
    paidAmount: 300000,
    balanceDue: 280000,
    deliveryDate: '2026-10-16',
    isManualBalanceOverride: false,
    createdAt: '2026-10-04T14:00:00Z',
  },
  {
    id: 'fur-302',
    clientId: 'cli-103',
    clientName: 'Mariana Victoria Gómez',
    furnitureType: 'Juego de 6 Sillas de Comedor',
    observations: 'Tapizado de asientos en lino rústico beige con proceso teflonado y cambio de gomaespuma de alta densidad 28 kg.',
    status: 'completed',
    totalAmount: 260000,
    paidAmount: 260000,
    balanceDue: 0,
    deliveryDate: '2026-10-07',
    isManualBalanceOverride: false,
    createdAt: '2026-09-28T11:00:00Z',
    completedAt: '2026-10-07T18:00:00Z',
  },
  {
    id: 'fur-303',
    clientId: 'cli-102',
    clientName: 'Estudio de Arquitectura & Diseño Sur',
    furnitureType: '2 Butacas de Espera / Recepción',
    observations: 'Estructura en madera paraíso lustrada, tapizado en bouclé blanco crudo con vivos reforzados.',
    status: 'on_hold',
    totalAmount: 270000,
    paidAmount: 150000,
    balanceDue: 120000,
    deliveryDate: '2026-10-20',
    isManualBalanceOverride: false,
    createdAt: '2026-10-07T15:30:00Z',
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-401',
    orderId: 'wo-201',
    orderType: 'vehicle',
    clientId: 'cli-101',
    clientName: 'Roberto Alejandro Sánchez',
    itemDescription: 'Hilux AE 412 KL (Butacas)',
    amount: 200000,
    paymentMethod: 'transfer',
    paymentDate: '2026-10-05',
    referenceNumber: 'TRF-8812',
    recordedBy: 'Laura Benítez',
    notes: 'Seña inicial 60% para compra de cuero.',
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'pay-402',
    orderId: 'fur-301',
    orderType: 'furniture',
    clientId: 'cli-102',
    clientName: 'Estudio de Arquitectura & Diseño Sur',
    itemDescription: 'Sofá Chesterfield Pana Verde',
    amount: 300000,
    paymentMethod: 'transfer',
    paymentDate: '2026-10-04',
    referenceNumber: 'TRF-9034',
    recordedBy: 'Valeria Ramos',
    notes: 'Adelanto 50% para compra de pana importada.',
    createdAt: '2026-10-04T15:00:00Z',
  },
  {
    id: 'pay-403',
    orderId: 'fur-302',
    orderType: 'furniture',
    clientId: 'cli-103',
    clientName: 'Mariana Victoria Gómez',
    itemDescription: '6 Sillas de Comedor Lino',
    amount: 260000,
    paymentMethod: 'cash',
    paymentDate: '2026-10-07',
    referenceNumber: 'REC-104',
    recordedBy: 'Valeria Ramos',
    notes: 'Pago total contra entrega del juego terminado.',
    createdAt: '2026-10-07T18:00:00Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    action: 'Apertura de Tapizado Hilux #wo-201',
    entityType: 'workOrder',
    entityId: 'wo-201',
    details: 'Patente AE 412 KL. Entrega: 12/10/2026',
    performedBy: 'Bruno Fierro',
    timestamp: '2026-10-05T08:30:00Z',
  },
  {
    id: 'log-2',
    action: 'Ingreso Mueble Chesterfield #fur-301',
    entityType: 'furniture',
    entityId: 'fur-301',
    details: 'Sofá 3 cuerpos pana esmeralda. Entrega: 16/10/2026',
    performedBy: 'Darío Navarro',
    timestamp: '2026-10-04T14:00:00Z',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('tapiceria_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() => {
    const saved = localStorage.getItem('tapiceria_workOrders');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_ORDERS;
  });

  const [furnitureOrders, setFurnitureOrders] = useState<FurnitureOrder[]>(() => {
    const saved = localStorage.getItem('tapiceria_furnitureOrders');
    return saved ? JSON.parse(saved) : INITIAL_FURNITURE_ORDERS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('tapiceria_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('tapiceria_auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('gestion_teamMembers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_TEAM;
  });

  const [currentUser, setCurrentUser] = useState<TeamMember>(() => teamMembers[0] || DEFAULT_TEAM[0]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'vehicles' | 'furniture' | 'clients' | 'payments' | 'invoices' | 'specs'>('dashboard');

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const databaseId = 'ai-studio-b27e48ec-6f1f-48a4-9e4a-e5438514a673';

  // Modals state
  const [modalState, setModalState] = useState<{
    clientModalOpen: boolean;
    selectedClient: Client | null;
    workOrderModalOpen: boolean;
    selectedWorkOrder: WorkOrder | null;
    furnitureModalOpen: boolean;
    selectedFurnitureOrder: FurnitureOrder | null;
    paymentModalOpen: boolean;
    paymentTarget: { id: string; type: 'vehicle' | 'furniture'; balanceDue: number; clientName: string; description: string } | null;
    invoiceModalOpen: boolean;
    invoiceData: any;
    whatsappModalOpen: boolean;
    whatsappData: any;
    confirmModalOpen: boolean;
    confirmModalData: ConfirmModalData | null;
  }>({
    clientModalOpen: false,
    selectedClient: null,
    workOrderModalOpen: false,
    selectedWorkOrder: null,
    furnitureModalOpen: false,
    selectedFurnitureOrder: null,
    paymentModalOpen: false,
    paymentTarget: null,
    invoiceModalOpen: false,
    invoiceData: null,
    whatsappModalOpen: false,
    whatsappData: null,
    confirmModalOpen: false,
    confirmModalData: null,
  });

  // Local storage sync
  useEffect(() => {
    localStorage.setItem('tapiceria_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('tapiceria_workOrders', JSON.stringify(workOrders));
  }, [workOrders]);

  useEffect(() => {
    localStorage.setItem('tapiceria_furnitureOrders', JSON.stringify(furnitureOrders));
  }, [furnitureOrders]);

  useEffect(() => {
    localStorage.setItem('tapiceria_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('tapiceria_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gestion_teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Boot & Firebase listeners
  useEffect(() => {
    testConnection().then(() => setIsFirebaseConnected(true)).catch(() => setIsFirebaseConnected(false));

    const unsubAuth = auth.onAuthStateChanged((user) => {
      setFirebaseAuthUser(user);
      if (user && user.displayName) {
        setCurrentUser({
          id: user.uid,
          name: user.displayName,
          email: user.email || 'tapiceria@autopro.com',
          role: 'Administrador',
          avatar: user.photoURL || undefined,
        });
      }
    });

    return () => unsubAuth();
  }, []);

  // Sync with Firestore
  const syncWithFirestore = useCallback(async () => {
    if (!auth.currentUser) return;
    setSyncStatus('syncing');
    try {
      const snapClients = await getDocs(collection(db, 'clients')).catch((err) =>
        handleFirestoreError(err, OperationType.LIST, 'clients')
      );
      if (!snapClients.empty) {
        const list: Client[] = [];
        snapClients.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setClients(list);
      }

      const snapVehicles = await getDocs(collection(db, 'workOrders')).catch((err) =>
        handleFirestoreError(err, OperationType.LIST, 'workOrders')
      );
      if (!snapVehicles.empty) {
        const list: WorkOrder[] = [];
        snapVehicles.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setWorkOrders(list);
      }

      const snapFurniture = await getDocs(collection(db, 'furnitureOrders')).catch((err) =>
        handleFirestoreError(err, OperationType.LIST, 'furnitureOrders')
      );
      if (!snapFurniture.empty) {
        const list: FurnitureOrder[] = [];
        snapFurniture.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setFurnitureOrders(list);
      }

      const snapPayments = await getDocs(collection(db, 'payments')).catch((err) =>
        handleFirestoreError(err, OperationType.LIST, 'payments')
      );
      if (!snapPayments.empty) {
        const list: Payment[] = [];
        snapPayments.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setPayments(list);
      }

      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('es-AR'));
    } catch (err) {
      console.warn('Sync notice:', err);
      setSyncStatus('error');
    }
  }, []);

  // Real-time Firestore snapshot listeners when signed in
  useEffect(() => {
    if (!firebaseAuthUser) return;
    const unsubs: Array<() => void> = [];

    try {
      const u1 = onSnapshot(collection(db, 'clients'), (snap) => {
        if (!snap.empty) {
          const l: Client[] = [];
          snap.forEach((d) => l.push({ id: d.id, ...(d.data() as any) }));
          setClients(l);
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('es-AR'));
        }
      });
      unsubs.push(u1);

      const u2 = onSnapshot(collection(db, 'workOrders'), (snap) => {
        if (!snap.empty) {
          const l: WorkOrder[] = [];
          snap.forEach((d) => l.push({ id: d.id, ...(d.data() as any) }));
          setWorkOrders(l);
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('es-AR'));
        }
      });
      unsubs.push(u2);

      const u3 = onSnapshot(collection(db, 'furnitureOrders'), (snap) => {
        if (!snap.empty) {
          const l: FurnitureOrder[] = [];
          snap.forEach((d) => l.push({ id: d.id, ...(d.data() as any) }));
          setFurnitureOrders(l);
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('es-AR'));
        }
      });
      unsubs.push(u3);

      const u4 = onSnapshot(collection(db, 'payments'), (snap) => {
        if (!snap.empty) {
          const l: Payment[] = [];
          snap.forEach((d) => l.push({ id: d.id, ...(d.data() as any) }));
          setPayments(l);
          setSyncStatus('synced');
          setLastSyncTime(new Date().toLocaleTimeString('es-AR'));
        }
      });
      unsubs.push(u4);
    } catch (e) {
      console.warn('Snapshot error:', e);
    }

    return () => unsubs.forEach((u) => u());
  }, [firebaseAuthUser]);

  // Recalculate client balances across both vehicles and furniture
  const recalculateClientTotals = (clientId: string, allVehicles: WorkOrder[], allFurniture: FurnitureOrder[]) => {
    const cVehicles = allVehicles.filter((v) => v.clientId === clientId);
    const cFurniture = allFurniture.filter((f) => f.clientId === clientId);

    const totalSpent =
      cVehicles.reduce((s, v) => s + (v.totalAmount || 0), 0) +
      cFurniture.reduce((s, f) => s + (f.totalAmount || 0), 0);

    const totalDebt =
      cVehicles.reduce((s, v) => s + (v.balanceDue || 0), 0) +
      cFurniture.reduce((s, f) => s + (f.balanceDue || 0), 0);

    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, totalSpent, totalDebt, updatedAt: new Date().toISOString() } : c))
    );

    if (firebaseAuthUser) {
      updateDoc(doc(db, 'clients', clientId), { totalSpent, totalDebt, updatedAt: new Date().toISOString() }).catch(
        (err) => handleFirestoreError(err, OperationType.UPDATE, `clients/${clientId}`)
      );
    }
  };

  // =========================================================================
  // CRUD: CLIENTES
  // =========================================================================

  const createClient = async (clientData: Omit<Client, 'id' | 'totalSpent' | 'totalDebt' | 'createdAt'>): Promise<string> => {
    const newId = `cli-${Date.now().toString().slice(-6)}`;
    const newClient: Client = {
      ...clientData,
      id: newId,
      totalSpent: 0,
      totalDebt: 0,
      createdAt: new Date().toISOString(),
    };

    setClients((prev) => [newClient, ...prev]);

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: `Alta Cliente: ${clientData.fullName}`,
      entityType: 'client',
      entityId: newId,
      details: `Tel: ${clientData.phone}`,
      performedBy: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (firebaseAuthUser) {
      try {
        await setDoc(doc(db, 'clients', newId), newClient);
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `clients/${newId}`);
      }
    }

    return newId;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const updatedAt = new Date().toISOString();
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData, updatedAt } : c)));

    if (firebaseAuthUser) {
      try {
        await updateDoc(doc(db, 'clients', id), { ...clientData, updatedAt });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `clients/${id}`);
      }
    }
  };

  const deleteClient = async (id: string) => {
    const clientTarget = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    setWorkOrders((prev) => prev.filter((w) => w.clientId !== id));
    setFurnitureOrders((prev) => prev.filter((f) => f.clientId !== id));
    setPayments((prev) => prev.filter((p) => p.clientId !== id));

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: `Eliminación de Cliente: ${clientTarget ? clientTarget.fullName : id}`,
      entityType: 'client',
      entityId: id,
      details: 'Cliente y registros asociados eliminados',
      performedBy: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (firebaseAuthUser) {
      try {
        await deleteDoc(doc(db, 'clients', id));
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
      }
    }
  };

  const getClientById = (id: string) => clients.find((c) => c.id === id);

  // =========================================================================
  // CRUD: TAPICERÍA AUTOMOTRIZ (VEHÍCULOS / PATENTES)
  // =========================================================================

  const createWorkOrder = async (
    orderData: Omit<WorkOrder, 'id' | 'paidAmount' | 'balanceDue' | 'createdAt'> & { customBalance?: number }
  ): Promise<string> => {
    const newId = `wo-${Date.now().toString().slice(-6)}`;
    const totalAmount = Number(orderData.totalAmount) || 0;
    const balanceDue = orderData.isManualBalanceOverride && orderData.customBalance !== undefined
      ? Number(orderData.customBalance)
      : totalAmount;

    const newOrder: WorkOrder = {
      id: newId,
      clientId: orderData.clientId,
      clientName: orderData.clientName,
      vehiclePlate: orderData.vehiclePlate.toUpperCase().trim(),
      vehicleModel: orderData.vehicleModel.trim(),
      technicalNotes: orderData.technicalNotes.trim(),
      status: orderData.status,
      totalAmount,
      paidAmount: 0,
      balanceDue,
      deliveryDate: orderData.deliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      isManualBalanceOverride: orderData.isManualBalanceOverride || false,
      manualBalanceReason: orderData.manualBalanceReason || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...workOrders];
    setWorkOrders(updated);
    recalculateClientTotals(orderData.clientId, updated, furnitureOrders);

    if (firebaseAuthUser) {
      try {
        await setDoc(doc(db, 'workOrders', newId), newOrder);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `workOrders/${newId}`);
      }
    }

    return newId;
  };

  const updateWorkOrder = async (id: string, orderData: Partial<WorkOrder>) => {
    let updated: WorkOrder[] = [];
    setWorkOrders((prev) => {
      updated = prev.map((o) => {
        if (o.id !== id) return o;
        const total = orderData.totalAmount !== undefined ? Number(orderData.totalAmount) : o.totalAmount;
        const paid = orderData.paidAmount !== undefined ? Number(orderData.paidAmount) : o.paidAmount;
        let bal = o.balanceDue;
        if (orderData.balanceDue !== undefined) {
          bal = Number(orderData.balanceDue);
        } else if (!orderData.isManualBalanceOverride && !o.isManualBalanceOverride) {
          bal = Math.max(0, total - paid);
        }
        return {
          ...o,
          ...orderData,
          totalAmount: total,
          paidAmount: paid,
          balanceDue: bal,
          updatedAt: new Date().toISOString(),
          completedAt: orderData.status === 'completed' && !o.completedAt ? new Date().toISOString() : o.completedAt,
        };
      });
      return updated;
    });

    const target = workOrders.find((w) => w.id === id);
    if (target) {
      recalculateClientTotals(target.clientId, updated, furnitureOrders);
    }

    if (firebaseAuthUser) {
      try {
        await updateDoc(doc(db, 'workOrders', id), { ...orderData, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `workOrders/${id}`);
      }
    }
  };

  const deleteWorkOrder = async (id: string) => {
    const target = workOrders.find((w) => w.id === id);
    const updated = workOrders.filter((w) => w.id !== id);
    setWorkOrders(updated);
    if (target) {
      recalculateClientTotals(target.clientId, updated, furnitureOrders);
    }

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: `Eliminación Orden Vehicular #${id}`,
      entityType: 'workOrder',
      entityId: id,
      details: target ? `Patente: ${target.vehiclePlate} (${target.vehicleModel})` : 'Orden eliminada',
      performedBy: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (firebaseAuthUser) {
      try {
        await deleteDoc(doc(db, 'workOrders', id));
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `workOrders/${id}`);
      }
    }
  };

  const getWorkOrderById = (id: string) => workOrders.find((w) => w.id === id);

  // =========================================================================
  // CRUD: APARTADO DE MUEBLES & HOGAR
  // =========================================================================

  const createFurnitureOrder = async (
    orderData: Omit<FurnitureOrder, 'id' | 'paidAmount' | 'balanceDue' | 'createdAt'> & { customBalance?: number }
  ): Promise<string> => {
    const newId = `fur-${Date.now().toString().slice(-6)}`;
    const totalAmount = Number(orderData.totalAmount) || 0;
    const balanceDue = orderData.isManualBalanceOverride && orderData.customBalance !== undefined
      ? Number(orderData.customBalance)
      : totalAmount;

    const newOrder: FurnitureOrder = {
      id: newId,
      clientId: orderData.clientId,
      clientName: orderData.clientName,
      furnitureType: orderData.furnitureType.trim(),
      observations: orderData.observations.trim(),
      status: orderData.status,
      totalAmount,
      paidAmount: 0,
      balanceDue,
      deliveryDate: orderData.deliveryDate || new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      isManualBalanceOverride: orderData.isManualBalanceOverride || false,
      manualBalanceReason: orderData.manualBalanceReason || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newOrder, ...furnitureOrders];
    setFurnitureOrders(updated);
    recalculateClientTotals(orderData.clientId, workOrders, updated);

    if (firebaseAuthUser) {
      try {
        await setDoc(doc(db, 'furnitureOrders', newId), newOrder);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `furnitureOrders/${newId}`);
      }
    }

    return newId;
  };

  const updateFurnitureOrder = async (id: string, orderData: Partial<FurnitureOrder>) => {
    let updated: FurnitureOrder[] = [];
    setFurnitureOrders((prev) => {
      updated = prev.map((f) => {
        if (f.id !== id) return f;
        const total = orderData.totalAmount !== undefined ? Number(orderData.totalAmount) : f.totalAmount;
        const paid = orderData.paidAmount !== undefined ? Number(orderData.paidAmount) : f.paidAmount;
        let bal = f.balanceDue;
        if (orderData.balanceDue !== undefined) {
          bal = Number(orderData.balanceDue);
        } else if (!orderData.isManualBalanceOverride && !f.isManualBalanceOverride) {
          bal = Math.max(0, total - paid);
        }
        return {
          ...f,
          ...orderData,
          totalAmount: total,
          paidAmount: paid,
          balanceDue: bal,
          completedAt: orderData.status === 'completed' && !f.completedAt ? new Date().toISOString() : f.completedAt,
        };
      });
      return updated;
    });

    const target = furnitureOrders.find((f) => f.id === id);
    if (target) {
      recalculateClientTotals(target.clientId, workOrders, updated);
    }

    if (firebaseAuthUser) {
      try {
        await updateDoc(doc(db, 'furnitureOrders', id), { ...orderData, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `furnitureOrders/${id}`);
      }
    }
  };

  const deleteFurnitureOrder = async (id: string) => {
    const target = furnitureOrders.find((f) => f.id === id);
    const updated = furnitureOrders.filter((f) => f.id !== id);
    setFurnitureOrders(updated);
    if (target) {
      recalculateClientTotals(target.clientId, workOrders, updated);
    }

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      action: `Eliminación Orden Mueble #${id}`,
      entityType: 'furniture',
      entityId: id,
      details: target ? `Mueble: ${target.furnitureType}` : 'Mueble eliminado',
      performedBy: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [log, ...prev]);

    if (firebaseAuthUser) {
      try {
        await deleteDoc(doc(db, 'furnitureOrders', id));
        await setDoc(doc(db, 'auditLogs', log.id), log);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `furnitureOrders/${id}`);
      }
    }
  };

  const getFurnitureOrderById = (id: string) => furnitureOrders.find((f) => f.id === id);

  // =========================================================================
  // PAGOS Y ABONOS (AUTO RECALCULA SALDOS)
  // =========================================================================

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<string> => {
    const newId = `pay-${Date.now().toString().slice(-6)}`;
    const newPayment: Payment = {
      ...paymentData,
      amount: Number(paymentData.amount),
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => [newPayment, ...prev]);

    let updatedVehicles = [...workOrders];
    let updatedFurniture = [...furnitureOrders];

    if (paymentData.orderType === 'vehicle') {
      updatedVehicles = workOrders.map((o) => {
        if (o.id !== paymentData.orderId) return o;
        const newPaid = (o.paidAmount || 0) + newPayment.amount;
        const newBal = o.isManualBalanceOverride ? Math.max(0, o.balanceDue - newPayment.amount) : Math.max(0, o.totalAmount - newPaid);
        const st = newBal === 0 && o.status === 'in_progress' ? 'completed' : o.status;
        return { ...o, paidAmount: newPaid, balanceDue: newBal, status: st };
      });
      setWorkOrders(updatedVehicles);
    } else {
      updatedFurniture = furnitureOrders.map((f) => {
        if (f.id !== paymentData.orderId) return f;
        const newPaid = (f.paidAmount || 0) + newPayment.amount;
        const newBal = f.isManualBalanceOverride ? Math.max(0, f.balanceDue - newPayment.amount) : Math.max(0, f.totalAmount - newPaid);
        const st = newBal === 0 && f.status === 'in_progress' ? 'completed' : f.status;
        return { ...f, paidAmount: newPaid, balanceDue: newBal, status: st };
      });
      setFurnitureOrders(updatedFurniture);
    }

    recalculateClientTotals(paymentData.clientId, updatedVehicles, updatedFurniture);

    if (firebaseAuthUser) {
      try {
        await setDoc(doc(db, 'payments', newId), newPayment);
        if (paymentData.orderType === 'vehicle') {
          const target = updatedVehicles.find((v) => v.id === paymentData.orderId);
          if (target) await updateDoc(doc(db, 'workOrders', target.id), { paidAmount: target.paidAmount, balanceDue: target.balanceDue, status: target.status });
        } else {
          const target = updatedFurniture.find((f) => f.id === paymentData.orderId);
          if (target) await updateDoc(doc(db, 'furnitureOrders', target.id), { paidAmount: target.paidAmount, balanceDue: target.balanceDue, status: target.status });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `payments/${newId}`);
      }
    }

    return newId;
  };

  const deletePayment = async (id: string) => {
    const p = payments.find((x) => x.id === id);
    if (!p) return;
    setPayments((prev) => prev.filter((x) => x.id !== id));

    let updatedVehicles = [...workOrders];
    let updatedFurniture = [...furnitureOrders];

    if (p.orderType === 'vehicle') {
      updatedVehicles = workOrders.map((o) => {
        if (o.id !== p.orderId) return o;
        const newPaid = Math.max(0, o.paidAmount - p.amount);
        const newBal = o.isManualBalanceOverride ? o.balanceDue + p.amount : Math.max(0, o.totalAmount - newPaid);
        return { ...o, paidAmount: newPaid, balanceDue: newBal };
      });
      setWorkOrders(updatedVehicles);
    } else {
      updatedFurniture = furnitureOrders.map((f) => {
        if (f.id !== p.orderId) return f;
        const newPaid = Math.max(0, f.paidAmount - p.amount);
        const newBal = f.isManualBalanceOverride ? f.balanceDue + p.amount : Math.max(0, f.totalAmount - newPaid);
        return { ...f, paidAmount: newPaid, balanceDue: newBal };
      });
      setFurnitureOrders(updatedFurniture);
    }

    recalculateClientTotals(p.clientId, updatedVehicles, updatedFurniture);

    if (firebaseAuthUser) {
      try {
        await deleteDoc(doc(db, 'payments', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `payments/${id}`);
      }
    }
  };

  // Modal triggers
  const openClientModal = (client: Client | null = null) => {
    setModalState((prev) => ({ ...prev, clientModalOpen: true, selectedClient: client }));
  };
  const closeClientModal = () => {
    setModalState((prev) => ({ ...prev, clientModalOpen: false, selectedClient: null }));
  };

  const openWorkOrderModal = (order: WorkOrder | null = null, preselectedClientId?: string) => {
    setModalState((prev) => ({
      ...prev,
      workOrderModalOpen: true,
      selectedWorkOrder: order || (preselectedClientId ? ({ clientId: preselectedClientId } as any) : null),
    }));
  };
  const closeWorkOrderModal = () => {
    setModalState((prev) => ({ ...prev, workOrderModalOpen: false, selectedWorkOrder: null }));
  };

  const openFurnitureModal = (order: FurnitureOrder | null = null, preselectedClientId?: string) => {
    setModalState((prev) => ({
      ...prev,
      furnitureModalOpen: true,
      selectedFurnitureOrder: order || (preselectedClientId ? ({ clientId: preselectedClientId } as any) : null),
    }));
  };
  const closeFurnitureModal = () => {
    setModalState((prev) => ({ ...prev, furnitureModalOpen: false, selectedFurnitureOrder: null }));
  };

  const openPaymentModal = (target: { id: string; type: 'vehicle' | 'furniture'; balanceDue: number; clientName: string; description: string } | null = null) => {
    setModalState((prev) => ({ ...prev, paymentModalOpen: true, paymentTarget: target }));
  };
  const closePaymentModal = () => {
    setModalState((prev) => ({ ...prev, paymentModalOpen: false, paymentTarget: null }));
  };

  const openInvoiceModal = (data: any) => {
    setModalState((prev) => ({ ...prev, invoiceModalOpen: true, invoiceData: data }));
  };
  const closeInvoiceModal = () => {
    setModalState((prev) => ({ ...prev, invoiceModalOpen: false, invoiceData: null }));
  };

  const openWhatsAppModal = (data: any) => {
    setModalState((prev) => ({ ...prev, whatsappModalOpen: true, whatsappData: data }));
  };
  const closeWhatsAppModal = () => {
    setModalState((prev) => ({ ...prev, whatsappModalOpen: false, whatsappData: null }));
  };

  const openConfirmModal = (data: ConfirmModalData) => {
    setModalState((prev) => ({ ...prev, confirmModalOpen: true, confirmModalData: data }));
  };
  const closeConfirmModal = () => {
    setModalState((prev) => ({ ...prev, confirmModalOpen: false, confirmModalData: null }));
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      await syncWithFirestore();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await logoutUser();
      setFirebaseAuthUser(null);
      setCurrentUser(DEFAULT_TEAM[0]);
    } catch (e) {
      console.error(e);
    }
  };

  // Puestos / Miembros del Equipo
  const addTeamMember = async (name: string, role: string, email?: string): Promise<string> => {
    const newId = `usr-${Date.now().toString().slice(-6)}`;
    const newMember: TeamMember = {
      id: newId,
      name: name.trim(),
      role: role.trim() || 'Colaborador',
      email: email?.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gestion.com`,
    };
    setTeamMembers((prev) => [...prev, newMember]);
    return newId;
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteTeamMember = async (id: string) => {
    if (teamMembers.length <= 1) return;
    const remaining = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(remaining);
    if (currentUser.id === id && remaining.length > 0) {
      setCurrentUser(remaining[0]);
    }
  };

  const resetToDemoSeed = () => {
    setClients(INITIAL_CLIENTS);
    setWorkOrders(INITIAL_VEHICLE_ORDERS);
    setFurnitureOrders(INITIAL_FURNITURE_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem('tapiceria_clients');
    localStorage.removeItem('tapiceria_workOrders');
    localStorage.removeItem('tapiceria_furnitureOrders');
    localStorage.removeItem('tapiceria_payments');
    localStorage.removeItem('tapiceria_auditLogs');
  };

  return (
    <AppContext.Provider
      value={{
        clients,
        workOrders,
        furnitureOrders,
        payments,
        auditLogs,
        currentUser,
        teamMembers,
        setCurrentUser,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        activeTab,
        setActiveTab,
        isFirebaseConnected,
        isFirebaseUser: !!firebaseAuthUser,
        firebaseAuthUser,
        databaseId,
        syncStatus,
        lastSyncTime,
        syncWithFirestore,
        createClient,
        updateClient,
        deleteClient,
        getClientById,
        addClient: createClient,
        createWorkOrder,
        updateWorkOrder,
        deleteWorkOrder,
        getWorkOrderById,
        addWorkOrder: createWorkOrder,
        createFurnitureOrder,
        updateFurnitureOrder,
        deleteFurnitureOrder,
        getFurnitureOrderById,
        addPayment,
        deletePayment,
        modalState,
        openClientModal,
        closeClientModal,
        openWorkOrderModal,
        closeWorkOrderModal,
        openFurnitureModal,
        closeFurnitureModal,
        openPaymentModal,
        closePaymentModal,
        openInvoiceModal,
        closeInvoiceModal,
        openWhatsAppModal,
        closeWhatsAppModal,
        openConfirmModal,
        closeConfirmModal,
        handleGoogleLogin,
        handleGoogleLogout,
        resetToDemoSeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
