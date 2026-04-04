#sqltablas 

1. branches 🆗 
    // Sucursales => branches hasta la sucursal Murillo
    DELETE FROM branches WHERE id > 11;
    SELECT setval('branches_id_seq', 11);

2. cars posibilidad de hacer una api a la otra aplicacion para la actualizacion en uns sola tabla y que los cambios
   se reflejen dos sistemas a la vez

3. cuentas
    DELETE FROM cuentas WHERE id > 2;
    SELECT setval('cuentas_id_seq', 2 );

4. customers
    Analizar posible, asignacion de carpetas para los asesores financieros

5. role
    GERENTE => 4 USUARIOS (SOCIOS)
    ADMIN => 1 USUARIO (REP. LEGAL => JEFA MONICA)
    ADMIN_COLAB => 1 USUARIO (JEFA PAOLA COCHABAMBA)
    JEFE_PERSONAL => 10 USUARIOS (10 SUCURSALES)
    ASESOR_FINANCIERO = ? (AUN NO TIENE NINGUN PROCESO ASIGNADO)
    ASESOR_VENTAS = ? (AUN NO TIENE NINGUN PROCESO ASIGNADO )

    LOS ULTIMOS DOS ROLES SOLO SON RE REFERENCIA PARA PAGOS DE SUELDO Y COMISIONES

6. status_transaction


7. team
8. transactions
9. type_pay
10. type_sale
11. type_transaction

- SELECT setval('branches_id_seq', 10); => reinicial el id desde el id requerirdo

 

