-- Migración: un solo centro médico CECARLAM
-- Conserva todos los doctores (4), pacientes (86), medicamentos, etc.
-- Fecha: 2026

BEGIN;

-- 1) Crear la clínica CECARLAM (doctor_id = Dr. Jorge M. Pichardo Ureña)
INSERT INTO clinics (id, name, address, phone, email, website, doctor_id, is_active, created_at, updated_at)
VALUES (
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'CECARLAM',
  'Centro Médico CECARLAM',
  NULL,
  NULL,
  NULL,
  '97cda128-d020-41c2-ad64-90dbe46a40d9'::uuid,  -- Dr. Jorge M. Pichardo Ureña
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Si la clínica ya existía con otro id, usar la variable abajo; si no, usamos el id fijo
DO $$
DECLARE
  cecarlam_id uuid := 'a0000001-0000-4000-8000-000000000001'::uuid;
BEGIN
  -- 2) Reasignar todos los pacientes a CECARLAM
  UPDATE patients SET clinic_id = cecarlam_id;

  -- 3) Reasignar citas
  UPDATE appointments SET clinic_id = cecarlam_id;

  -- 4) Reasignar facturas
  UPDATE invoices SET clinic_id = cecarlam_id;

  -- 5) Reasignar prescripciones
  UPDATE prescriptions SET clinic_id = cecarlam_id;

  -- 6) Reasignar historias clínicas
  UPDATE medical_records SET clinic_id = cecarlam_id;

  -- 7) Reasignar servicios médicos (medical_services)
  UPDATE medical_services SET clinic_id = cecarlam_id;

  -- 8) Tablas opcionales que pueden tener clinic_id
  UPDATE email_communications SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE messages SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE notifications SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE reports SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE laboratory_integrations SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE medical_references SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;

  -- email_templates y system_settings: actualizar o eliminar registros de otras clínicas
  UPDATE email_templates SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
  UPDATE system_settings SET clinic_id = cecarlam_id WHERE clinic_id IS NOT NULL;
END $$;

-- 9) Eliminar todas las asignaciones usuario-clínica y asignar todos los usuarios a CECARLAM
DELETE FROM user_clinics;

INSERT INTO user_clinics (user_id, clinic_id, role)
SELECT id, 'a0000001-0000-4000-8000-000000000001'::uuid,
  CASE
    WHEN role = 'admin' THEN 'admin'
    WHEN id = '97cda128-d020-41c2-ad64-90dbe46a40d9'::uuid THEN 'owner'
    ELSE 'staff'
  END
FROM users
WHERE is_active = true;

-- 10) Marcar clínicas antiguas como inactivas (no borrar por si hay referencias)
UPDATE clinics SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE id <> 'a0000001-0000-4000-8000-000000000001'::uuid;

COMMIT;
