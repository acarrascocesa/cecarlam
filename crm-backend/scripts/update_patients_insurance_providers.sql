-- Migración: actualizar insurance_provider en patients a la lista actual de seguros del doctor.
-- Ejecutar contra: cecarlam_crm (usuario cecarlam_user)

-- Valores actuales en BD → Nuevos valores (lista única)
-- SENASA_PENSIONADO, SENASA_CONTRIBUTIVO → SENASA
-- ARS_FUTURO → FUTURO
-- ARS_UNIVERSAL → UNIVERSAL
-- ARS_RESERVAS → RESERVAS
-- HUMANO, ARS_PRIMERA → PRIMERA HUMANO
-- SEMMA, APS, MAPFRE, SIN SEGURO → sin cambio
-- ARS_GMA, ARS_RENACER → no están en la nueva lista → SIN SEGURO

BEGIN;

-- 1) SENASA (Pensionado y Contributivo → SENASA)
UPDATE patients
SET insurance_provider = 'SENASA'
WHERE insurance_provider IN ('SENASA_PENSIONADO', 'SENASA_CONTRIBUTIVO');

-- 2) FUTURO
UPDATE patients
SET insurance_provider = 'FUTURO'
WHERE insurance_provider = 'ARS_FUTURO';

-- 3) UNIVERSAL
UPDATE patients
SET insurance_provider = 'UNIVERSAL'
WHERE insurance_provider = 'ARS_UNIVERSAL';

-- 4) RESERVAS
UPDATE patients
SET insurance_provider = 'RESERVAS'
WHERE insurance_provider = 'ARS_RESERVAS';

-- 5) PRIMERA HUMANO (HUMANO y ARS Primera)
UPDATE patients
SET insurance_provider = 'PRIMERA HUMANO'
WHERE insurance_provider IN ('HUMANO', 'ARS_PRIMERA');

-- 6) Códigos que ya no están en la lista del doctor → SIN SEGURO
UPDATE patients
SET insurance_provider = 'SIN SEGURO'
WHERE insurance_provider IN ('ARS_GMA', 'ARS_RENACER');

COMMIT;

-- Resumen después de migración
SELECT insurance_provider, COUNT(*) AS pacientes
FROM patients
GROUP BY insurance_provider
ORDER BY 2 DESC;
