export type OrderStatus = 'in_progress' | 'completed' | 'on_hold';

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  totalSpent: number;
  totalDebt: number;
  createdAt: string;
  updatedAt?: string;
}

// Tapicería Automotriz
export interface WorkOrder {
  id: string;
  clientId: string;
  clientName: string;
  vehiclePlate: string;
  vehicleModel: string;
  technicalNotes: string; // Observaciones
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  deliveryDate: string; // Fecha prometida de entrega para calendario
  isManualBalanceOverride?: boolean;
  manualBalanceReason?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

// Apartado Dedicado para Muebles & Hogar
export interface FurnitureOrder {
  id: string;
  clientId: string;
  clientName: string;
  furnitureType: string; // Ej: Sofá 3 cuerpos, Juego de 6 sillas, Butaca capitoné, etc.
  observations: string; // Observaciones de tela, espumas, tachas, estructura
  status: OrderStatus;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  deliveryDate: string; // Fecha de entrega
  isManualBalanceOverride?: boolean;
  manualBalanceReason?: string;
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
}

export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';

export interface Payment {
  id: string;
  orderId: string;
  orderType: 'vehicle' | 'furniture';
  clientId: string;
  clientName: string;
  itemDescription: string; // Patente o Tipo de mueble
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'client' | 'workOrder' | 'furniture' | 'payment';
  entityId: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string; // Puesto de trabajo / Cargo configurable
  avatar?: string;
}
