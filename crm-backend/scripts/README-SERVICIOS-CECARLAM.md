# Servicios CECARLAM – Tipos para facturación

Lista de servicios médicos cargados en `medical_services` para la clínica CECARLAM, usados como **tipos de servicio para facturación**.

## Organización por categoría

El sistema permite estas categorías: **Consulta**, **Procedimiento**, **Laboratorio**, **Imagenología**, **Terapia**, **Cortesía**. Para CECARLAM se usan tres:

| Categoría      | Contenido |
|----------------|-----------|
| **Consulta**   | Consulta especializada, Consulta cámara hiperbárica |
| **Procedimiento** | Electro/ecocardiograma, MAPA, Holter, prueba de esfuerzo, Dopplers, espiriometría, sesiones cámara hiperbárica |
| **Imagenología** | Todas las sonografías y todas las radiografías (RX) |

## Cómo cargar los servicios

Desde el servidor (ruta del proyecto CECARLAM), con el contenedor de Postgres corriendo:

```bash
docker exec -i c98ff9a25af8_cecarlam_postgres psql -U postgres -d cecarlam_crm -f - < crm-backend/scripts/seed_cecarlam_services.sql
```

Si el nombre del contenedor es otro, reemplazar `c98ff9a25af8_cecarlam_postgres` por el que devuelva `docker ps`.

## Reemplazar todos los servicios de CECARLAM

Si quieres borrar los servicios actuales de CECARLAM y dejar solo los del script, descomenta y ejecuta primero en la base:

```sql
DELETE FROM medical_services WHERE clinic_id = 'a0000001-0000-4000-8000-000000000001';
```

Luego ejecuta el `INSERT` del script. Si no borras, el script añadirá filas nuevas (pueden quedar duplicados por nombre si ya existían).

## Dónde se usan

Estos registros aparecen en el CRM como opciones al crear/editar ítems de factura (servicio + precio base). Los precios se pueden editar luego desde la pantalla de servicios de la clínica si el backend/frontend lo permiten.
