//Definimos la estructura de la base de datos para utilizarla a nivel global
export interface Customer {
    id: number
    ci: string
    name: string
    celphone: string
    reference: string
    ciudad: string 
    status: number // uso lógico (1 => cliente activo, 2 => cliente dado de baja)
}
