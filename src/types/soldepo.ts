// 🔹 Tipo base (estructura real de la tabla transactions)
export interface Soldepo {
  id: number;
  created_at: string;

  // Relaciones principales
  id_type_transaction: number;
  id_branch: number;
  id_employee: number;
  id_customer: number | null;
  id_car: number | null;
  id_status: number;

  // Datos financieros
  amount: number;               // Cuota inicial / depósito
  costo: number | null;         // Precio final negociado

  // Datos comerciales
  type_sale: string | null;
  type_pay: string | null;
  detail: string;
}

// 🟢 PARA INSERTAR NUEVA SOLICITUD / TRANSACCIÓN
export interface SoldepoInsert {
  id_type_transaction?: number;
  id_branch: number;
  id_employee: number;
  amount: number;
  detail: string;

  // Precio negociable real
  costo?: number | null;
  type_sale?: string | null;
  type_pay?: string | null;

  // Relaciones opcionales según flujo
  id_car?: number | null;
  id_customer?: number | null;

  // Default en BD = 1 (Pendiente)
  id_status?: number;
}

// 🔄 PARA ACTUALIZAR
export type SoldepoUpdate = Partial<SoldepoInsert>;

// 🔗 CON RELACIONES COMPLETAS
export interface SoldepoWithRelations extends Soldepo {
  // 🏢 Sucursal
  branches?: {
    id: number;
    name_branch: string;
  } | null;

  // 👤 Empleado
  employees?: {
    id: number;
    name: string;
  } | null;

  // 📄 Tipo de transacción
  type_transaction?: {
    id: number;
    description: string;
    type_trans: string;
  } | null;

  // 📌 Estado de transacción
  status_transaction?: {
    id: number;
    status: string;
  } | null;

  // 👥 Cliente
  customers?: {
    id: number;
    name: string;
  } | null;

  // 🚗 Vehículo
  cars?: {
    id: number;
    name: string;
    cost: number; // Precio catálogo fijo
    modelo: string;
    marca: string;
  } | null;
}
