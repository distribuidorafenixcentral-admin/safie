//Definimos la estructura de la base de datos para utilizarla a nivel global
export interface Branch {
    id: number
    name_branch: string
    adress_branch: string
    status: number // uso lógico (1 => actibo, 2 => inactivo)
}

