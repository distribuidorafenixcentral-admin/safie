//Definimos la estructura de la base de datos para utilizarla a nivel global
export interface Customer {
    id: number
    ci: number
    name: string
    celphone: string
    reference: string
    id_ciudad: number 
    status: number // uso lógico (1 => cliente actibo, 2 => cliente dado de baja)
}
