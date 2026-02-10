-- Personal Dr. Pichardo - 8 usuarios en 2 clínicas
-- Clínicas: Assistance (080637d0-dd81-4599-99aa-a0b5a0af39bb), Clínica Magnolia (40899d5d-de11-4690-b2f5-057bbc9fcdd5)
-- Contraseña: 123456 (hash bcrypt)

-- 1. Crear 7 usuarios nuevos (Evelyn ya existe)
INSERT INTO users (name, email, password_hash, role, is_active, specialty) VALUES
('MASSIEL A. MARTINEZ P.', 'abnneris@hotmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'secretary', true, NULL),
('ASHLEY A. PINEDA M.', 'marichalashley@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'secretary', true, NULL),
('JUANA M. NOVAS FRANCO', 'juanamaiel19@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'secretary', true, NULL),
('IGRAYNE CARVAJAL M.', 'carvajaligrayne@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'secretary', true, NULL),
('NICAURI HEREDIA C.', 'comasshaneli@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'secretary', true, NULL),
('SMERALDA MENTOR', 'smeraldamentor6@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'admin', true, NULL),
('DENICE PEREZ SANCHEZ', 'perezsanchezd-enice8@gmail.com', '$2b$10$FXPI8G8Zl3kxPlVck/.ZmeiJ65odyg2Y.rB/M4/igrh4kmvLUTtAG', 'doctor', true, 'Cardiología')
ON CONFLICT (email) DO NOTHING;

-- 2. Asignar los 8 usuarios a las 2 clínicas del Dr. Pichardo
-- Rol: admin para SMERALDA, staff para el resto (incl. DENICE como doctor con staff en clínica)
INSERT INTO user_clinics (user_id, clinic_id, role) VALUES
((SELECT id FROM users WHERE email = 'abnneris@hotmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'abnneris@hotmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'marichalashley@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'marichalashley@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'yelissagonzalez06@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'yelissagonzalez06@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'juanamaiel19@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'juanamaiel19@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'carvajaligrayne@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'carvajaligrayne@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'comasshaneli@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'staff'),
((SELECT id FROM users WHERE email = 'comasshaneli@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'staff'),
((SELECT id FROM users WHERE email = 'smeraldamentor6@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'admin'),
((SELECT id FROM users WHERE email = 'smeraldamentor6@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'admin'),
((SELECT id FROM users WHERE email = 'perezsanchezd-enice8@gmail.com'), '080637d0-dd81-4599-99aa-a0b5a0af39bb', 'admin'),
((SELECT id FROM users WHERE email = 'perezsanchezd-enice8@gmail.com'), '40899d5d-de11-4690-b2f5-057bbc9fcdd5', 'admin')
ON CONFLICT (user_id, clinic_id) DO NOTHING;
