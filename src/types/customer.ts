// Definimos la estructura de la base de datos para utilizarla a nivel global
export interface Customer {
    id: number
    ci: string
    name: string
    celphone: string
    reference: string
    ciudad: string 
    id_branch: number | null 
    status: number // uso lógico (1 => cliente activo, 2 => cliente dado de baja)
}

// 🔥 2. Tipo con relaciones para listados (Tablas, PDF, Excel)
export interface CustomerWithRelations extends Customer {
    branch: {
        id: number
        name_branch: string
    } | null
}

// ➕ 3. Tipo para la creación de nuevos clientes
export type CustomerInsert = Omit<Customer, "id"> & {
    id_branch?: number | null
}

// ✏️ 4. Tipo para la actualización de clientes existentes (Todos los campos opcionales)
export type CustomerUpdate = Partial<CustomerInsert>
