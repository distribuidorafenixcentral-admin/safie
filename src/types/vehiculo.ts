//Definimos la estructura de la base de datos para utilizarla a nivel global

export interface Vehiculo {
    id: number
    name: string
    cost: number
    modelo: string
    marca: string
    status: number // uso lógico (1 => activo, 2 => inactivo)
}

