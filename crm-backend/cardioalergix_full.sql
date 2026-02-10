--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: find_patient_by_cedula(character varying, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_patient_by_cedula(p_cedula character varying, p_user_id uuid) RETURNS TABLE(patient_id uuid, patient_name character varying, patient_email character varying, patient_cedula character varying, clinic_id uuid, clinic_name character varying, is_primary boolean)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.email,
        p.cedula,
        c.id,
        c.name,
        pcl.is_primary
    FROM patients p
    JOIN patient_clinic_links pcl ON p.id = pcl.patient_id
    JOIN clinics c ON pcl.clinic_id = c.id
    JOIN user_clinics uc ON c.id = uc.clinic_id
    WHERE p.cedula = p_cedula 
      AND uc.user_id = p_user_id
      AND pcl.status = 'active'
    ORDER BY pcl.is_primary DESC, c.name;
END;
$$;


ALTER FUNCTION public.find_patient_by_cedula(p_cedula character varying, p_user_id uuid) OWNER TO postgres;

--
-- Name: link_patient_to_clinic(uuid, uuid, uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.link_patient_to_clinic(p_patient_id uuid, p_clinic_id uuid, p_linked_by uuid, p_notes text DEFAULT NULL::text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Verificar que el paciente no esté ya vinculado a esa clínica
    IF EXISTS (
        SELECT 1 FROM patient_clinic_links 
        WHERE patient_id = p_patient_id AND clinic_id = p_clinic_id
    ) THEN
        RETURN FALSE; -- Ya existe el vínculo
    END IF;
    
    -- Crear el vínculo
    INSERT INTO patient_clinic_links (
        patient_id, clinic_id, linked_by, is_primary, status, notes
    ) VALUES (
        p_patient_id, p_clinic_id, p_linked_by, false, 'active', p_notes
    );
    
    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.link_patient_to_clinic(p_patient_id uuid, p_clinic_id uuid, p_linked_by uuid, p_notes text) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: acarrasco
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO acarrasco;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    doctor_id uuid,
    name character varying(255) NOT NULL,
    generic_name character varying(255),
    category character varying(100) NOT NULL,
    description text,
    instructions text,
    preparation text,
    contraindications text,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.analytics OWNER TO postgres;

--
-- Name: TABLE analytics; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.analytics IS 'Tabla para almacenar las analíticas médicas creadas por los doctores';


--
-- Name: COLUMN analytics.doctor_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.doctor_id IS 'ID del doctor que creó la analítica';


--
-- Name: COLUMN analytics.name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.name IS 'Nombre comercial de la analítica';


--
-- Name: COLUMN analytics.generic_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.generic_name IS 'Nombre genérico o abreviado';


--
-- Name: COLUMN analytics.category; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.category IS 'Categoría de la analítica (Sangre, Orina, etc.)';


--
-- Name: COLUMN analytics.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.description IS 'Descripción detallada de la analítica';


--
-- Name: COLUMN analytics.instructions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.instructions IS 'Instrucciones para el paciente';


--
-- Name: COLUMN analytics.preparation; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.preparation IS 'Preparación requerida';


--
-- Name: COLUMN analytics.contraindications; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.contraindications IS 'Contraindicaciones';


--
-- Name: COLUMN analytics.notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.notes IS 'Notas adicionales';


--
-- Name: COLUMN analytics.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.analytics.is_active IS 'Indica si la analítica está activa';


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.appointments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    doctor_id uuid,
    appointment_date date NOT NULL,
    appointment_time time without time zone NOT NULL,
    duration_minutes integer DEFAULT 30,
    appointment_type character varying(100),
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    reason text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    arrival_timestamp timestamp without time zone,
    CONSTRAINT appointments_status_check CHECK (((status)::text = ANY ((ARRAY['Confirmada'::character varying, 'Pendiente'::character varying, 'Cancelada'::character varying, 'Completada'::character varying])::text[])))
);


ALTER TABLE public.appointments OWNER TO acarrasco;

--
-- Name: automation_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.automation_logs (
    id integer NOT NULL,
    automation_type character varying(50) NOT NULL,
    execution_date timestamp without time zone DEFAULT now(),
    success_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    total_processed integer DEFAULT 0,
    config_used jsonb,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.automation_logs OWNER TO postgres;

--
-- Name: automation_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.automation_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.automation_logs_id_seq OWNER TO postgres;

--
-- Name: automation_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.automation_logs_id_seq OWNED BY public.automation_logs.id;


--
-- Name: clinics; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.clinics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    address text NOT NULL,
    phone character varying(50),
    email character varying(255),
    website character varying(500),
    doctor_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.clinics OWNER TO acarrasco;

--
-- Name: email_communications; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.email_communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    email_type character varying(50) NOT NULL,
    subject character varying(255) NOT NULL,
    body text NOT NULL,
    html_body text,
    attachments jsonb DEFAULT '[]'::jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    opened_at timestamp without time zone,
    template_used character varying(100),
    variables_data jsonb DEFAULT '{}'::jsonb,
    recipient_email character varying(255) NOT NULL,
    message_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_communications_email_type_check CHECK (((email_type)::text = ANY ((ARRAY['appointment_reminder'::character varying, 'results'::character varying, 'invoice'::character varying, 'prescription'::character varying, 'general'::character varying])::text[]))),
    CONSTRAINT email_communications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'delivered'::character varying, 'failed'::character varying, 'opened'::character varying])::text[])))
);


ALTER TABLE public.email_communications OWNER TO acarrasco;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clinic_id uuid,
    name character varying(100) NOT NULL,
    description text,
    subject_template character varying(255) NOT NULL,
    body_template text NOT NULL,
    html_template text,
    template_type character varying(50) NOT NULL,
    available_variables jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_templates_template_type_check CHECK (((template_type)::text = ANY ((ARRAY['appointment_reminder'::character varying, 'results_ready'::character varying, 'invoice_sent'::character varying, 'prescription_sent'::character varying, 'general'::character varying])::text[])))
);


ALTER TABLE public.email_templates OWNER TO acarrasco;

--
-- Name: invoice_insurance; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.invoice_insurance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    provider character varying(100),
    policy_number character varying(100),
    coverage_verified boolean DEFAULT false,
    verified_by uuid,
    verified_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.invoice_insurance OWNER TO acarrasco;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    invoice_id uuid,
    service_id uuid,
    description character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    insurance_covers numeric(10,2) DEFAULT 0,
    patient_pays numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    authorization_number character varying(50)
);


ALTER TABLE public.invoice_items OWNER TO acarrasco;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    doctor_id uuid,
    invoice_date date NOT NULL,
    total_services numeric(10,2) NOT NULL,
    insurance_covers numeric(10,2) DEFAULT 0,
    patient_pays numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    payment_method character varying(20),
    payment_date date,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    authorization_number character varying(50),
    CONSTRAINT invoices_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['Efectivo'::character varying, 'Tarjeta'::character varying, 'Transferencia'::character varying, 'Cheque'::character varying])::text[]))),
    CONSTRAINT invoices_status_check CHECK (((status)::text = ANY ((ARRAY['Pendiente'::character varying, 'Pagada'::character varying, 'Parcial'::character varying, 'Rechazada'::character varying])::text[])))
);


ALTER TABLE public.invoices OWNER TO acarrasco;

--
-- Name: laboratory_integrations; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.laboratory_integrations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    laboratory_name character varying(255) NOT NULL,
    logo_url character varying(500),
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    api_key character varying(255),
    last_sync timestamp without time zone,
    pending_results_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT laboratory_integrations_status_check CHECK (((status)::text = ANY ((ARRAY['Conectado'::character varying, 'Desconectado'::character varying, 'Pendiente'::character varying])::text[])))
);


ALTER TABLE public.laboratory_integrations OWNER TO acarrasco;

--
-- Name: medical_record_attachments; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.medical_record_attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    medical_record_id uuid,
    file_name character varying(255) NOT NULL,
    file_type character varying(100),
    file_url character varying(500) NOT NULL,
    file_size integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.medical_record_attachments OWNER TO acarrasco;

--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.medical_records (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    doctor_id uuid,
    record_date date NOT NULL,
    record_type character varying(100),
    diagnosis text,
    status character varying(20) DEFAULT 'Completo'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT medical_records_status_check CHECK (((status)::text = ANY ((ARRAY['Completo'::character varying, 'Pendiente'::character varying])::text[])))
);


ALTER TABLE public.medical_records OWNER TO acarrasco;

--
-- Name: medical_references; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.medical_references (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    doctor_id uuid,
    reference_date date NOT NULL,
    specialist_name character varying(255),
    specialty character varying(100),
    hospital character varying(255),
    status character varying(20) DEFAULT 'Pendiente'::character varying,
    priority character varying(20) DEFAULT 'Normal'::character varying,
    reason text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT medical_references_priority_check CHECK (((priority)::text = ANY ((ARRAY['Alta'::character varying, 'Normal'::character varying, 'Baja'::character varying])::text[]))),
    CONSTRAINT medical_references_status_check CHECK (((status)::text = ANY ((ARRAY['Pendiente'::character varying, 'En proceso'::character varying, 'Completada'::character varying, 'Cancelada'::character varying])::text[])))
);


ALTER TABLE public.medical_references OWNER TO acarrasco;

--
-- Name: medical_services; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.medical_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    name character varying(255) NOT NULL,
    category character varying(50),
    description text,
    base_price numeric(10,2) NOT NULL,
    insurance_coverage_percentage integer DEFAULT 0,
    insurance_type character varying(20),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    specialty character varying(50),
    CONSTRAINT medical_services_category_check CHECK (((category)::text = ANY (ARRAY[('Consulta'::character varying)::text, ('Procedimiento'::character varying)::text, ('Laboratorio'::character varying)::text, ('Imagenología'::character varying)::text, ('Terapia'::character varying)::text, ('Cortesía'::character varying)::text]))),
    CONSTRAINT medical_services_insurance_type_check CHECK (((insurance_type)::text = ANY ((ARRAY['Seguro'::character varying, 'No asegurado'::character varying, 'En negociación'::character varying])::text[])))
);


ALTER TABLE public.medical_services OWNER TO acarrasco;

--
-- Name: medications; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.medications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    doctor_id uuid,
    name character varying(255) NOT NULL,
    generic_name character varying(255),
    category character varying(50),
    dosage character varying(100),
    frequency character varying(100),
    typical_duration character varying(100),
    instructions text,
    contraindications text,
    side_effects text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT medications_category_check CHECK (((category)::text = ANY ((ARRAY['Antibióticos'::character varying, 'Analgésicos'::character varying, 'Cardiovasculares'::character varying, 'Antihistamínicos'::character varying, 'Corticosteroides'::character varying, 'Otros'::character varying])::text[])))
);


ALTER TABLE public.medications OWNER TO acarrasco;

--
-- Name: message_responses; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.message_responses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    message_id uuid,
    sender_type character varying(20) NOT NULL,
    sender_id uuid,
    content text NOT NULL,
    response_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT message_responses_sender_type_check CHECK (((sender_type)::text = ANY ((ARRAY['doctor'::character varying, 'patient'::character varying])::text[])))
);


ALTER TABLE public.message_responses OWNER TO acarrasco;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    sender_type character varying(20) NOT NULL,
    sender_id uuid,
    content text NOT NULL,
    message_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) DEFAULT 'Enviado'::character varying,
    message_type character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT messages_message_type_check CHECK (((message_type)::text = ANY ((ARRAY['Consulta'::character varying, 'Recordatorio'::character varying, 'Resultado'::character varying, 'General'::character varying])::text[]))),
    CONSTRAINT messages_sender_type_check CHECK (((sender_type)::text = ANY ((ARRAY['doctor'::character varying, 'patient'::character varying, 'system'::character varying])::text[]))),
    CONSTRAINT messages_status_check CHECK (((status)::text = ANY ((ARRAY['Enviado'::character varying, 'Entregado'::character varying, 'Leído'::character varying])::text[])))
);


ALTER TABLE public.messages OWNER TO acarrasco;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    user_id uuid,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    notification_type character varying(20) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    link_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_notification_type_check CHECK (((notification_type)::text = ANY ((ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO acarrasco;

--
-- Name: patient_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    patient_id uuid NOT NULL,
    file_name character varying(255) NOT NULL,
    file_type character varying(100),
    file_url character varying(500) NOT NULL,
    file_size integer,
    category character varying(50) DEFAULT 'general'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.patient_attachments OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.patients (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(50) NOT NULL,
    date_of_birth date NOT NULL,
    gender character varying(20),
    address text,
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(50),
    emergency_contact_relationship character varying(100),
    insurance_provider character varying(100),
    insurance_number character varying(100),
    blood_type character varying(10),
    allergies text[],
    chronic_conditions text[],
    status character varying(20) DEFAULT 'Activo'::character varying,
    avatar_url character varying(500),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cedula character varying(20),
    CONSTRAINT patients_gender_check CHECK (((gender IS NULL) OR ((gender)::text = ANY (ARRAY[('Masculino'::character varying)::text, ('Femenino'::character varying)::text, ('Otro'::character varying)::text])))),
    CONSTRAINT patients_status_check CHECK (((status)::text = ANY ((ARRAY['Activo'::character varying, 'Pendiente'::character varying, 'Inactivo'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO acarrasco;

--
-- Name: prescription_medications; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.prescription_medications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    prescription_id uuid,
    medication_id uuid,
    dosage character varying(100),
    frequency character varying(100),
    duration character varying(100),
    instructions text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.prescription_medications OWNER TO acarrasco;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.prescriptions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    clinic_id uuid,
    patient_id uuid,
    doctor_id uuid,
    prescription_date date NOT NULL,
    prescription_text text NOT NULL,
    status character varying(20) DEFAULT 'Activa'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prescriptions_status_check CHECK (((status)::text = ANY ((ARRAY['Activa'::character varying, 'Completada'::character varying, 'Cancelada'::character varying])::text[])))
);


ALTER TABLE public.prescriptions OWNER TO acarrasco;

--
-- Name: report_templates; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.report_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    type character varying(100) NOT NULL,
    template_config jsonb,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.report_templates OWNER TO acarrasco;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    format character varying(50) NOT NULL,
    filters jsonb,
    data jsonb,
    generated_by uuid,
    clinic_id uuid,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    file_path character varying(500),
    status character varying(50) DEFAULT 'completed'::character varying
);


ALTER TABLE public.reports OWNER TO acarrasco;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    user_id uuid,
    clinic_id uuid,
    clinic_name character varying(255),
    timezone character varying(100) DEFAULT 'America/Santo_Domingo'::character varying,
    language character varying(10) DEFAULT 'es'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO postgres;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: user_clinics; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.user_clinics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    clinic_id uuid,
    role character varying(20) DEFAULT 'staff'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_clinics_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'staff'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.user_clinics OWNER TO acarrasco;

--
-- Name: users; Type: TABLE; Schema: public; Owner: acarrasco
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    avatar_url character varying(500),
    license_number character varying(100),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    specialty character varying(50),
    multi_clinic_view boolean DEFAULT false,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['doctor'::character varying, 'secretary'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO acarrasco;

--
-- Name: automation_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automation_logs ALTER COLUMN id SET DEFAULT nextval('public.automation_logs_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: automation_logs automation_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automation_logs
    ADD CONSTRAINT automation_logs_pkey PRIMARY KEY (id);


--
-- Name: clinics clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_pkey PRIMARY KEY (id);


--
-- Name: email_communications email_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_communications
    ADD CONSTRAINT email_communications_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: invoice_insurance invoice_insurance_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_insurance
    ADD CONSTRAINT invoice_insurance_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: laboratory_integrations laboratory_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.laboratory_integrations
    ADD CONSTRAINT laboratory_integrations_pkey PRIMARY KEY (id);


--
-- Name: medical_record_attachments medical_record_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_record_attachments
    ADD CONSTRAINT medical_record_attachments_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: medical_references medical_references_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_pkey PRIMARY KEY (id);


--
-- Name: medical_services medical_services_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_services
    ADD CONSTRAINT medical_services_pkey PRIMARY KEY (id);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: message_responses message_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.message_responses
    ADD CONSTRAINT message_responses_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_attachments patient_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_attachments
    ADD CONSTRAINT patient_attachments_pkey PRIMARY KEY (id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: prescription_medications prescription_medications_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescription_medications
    ADD CONSTRAINT prescription_medications_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: report_templates report_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.report_templates
    ADD CONSTRAINT report_templates_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_user_id_clinic_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_user_id_clinic_id_key UNIQUE (user_id, clinic_id);


--
-- Name: user_clinics user_clinics_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT user_clinics_pkey PRIMARY KEY (id);


--
-- Name: user_clinics user_clinics_user_id_clinic_id_key; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT user_clinics_user_id_clinic_id_key UNIQUE (user_id, clinic_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_analytics_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_category ON public.analytics USING btree (category);


--
-- Name: idx_analytics_doctor_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_doctor_id ON public.analytics USING btree (doctor_id);


--
-- Name: idx_analytics_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_is_active ON public.analytics USING btree (is_active);


--
-- Name: idx_analytics_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_analytics_name ON public.analytics USING btree (name);


--
-- Name: idx_appointments_arrival; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_appointments_arrival ON public.appointments USING btree (arrival_timestamp);


--
-- Name: idx_appointments_clinic_date; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_appointments_clinic_date ON public.appointments USING btree (clinic_id, appointment_date);


--
-- Name: idx_appointments_patient_date; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_appointments_patient_date ON public.appointments USING btree (patient_id, appointment_date);


--
-- Name: idx_email_communications_clinic_id; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_communications_clinic_id ON public.email_communications USING btree (clinic_id);


--
-- Name: idx_email_communications_email_type; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_communications_email_type ON public.email_communications USING btree (email_type);


--
-- Name: idx_email_communications_patient_id; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_communications_patient_id ON public.email_communications USING btree (patient_id);


--
-- Name: idx_email_communications_sent_at; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_communications_sent_at ON public.email_communications USING btree (sent_at);


--
-- Name: idx_email_communications_status; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_communications_status ON public.email_communications USING btree (status);


--
-- Name: idx_email_templates_active; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_templates_active ON public.email_templates USING btree (is_active);


--
-- Name: idx_email_templates_clinic_id; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_templates_clinic_id ON public.email_templates USING btree (clinic_id);


--
-- Name: idx_email_templates_type; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_email_templates_type ON public.email_templates USING btree (template_type);


--
-- Name: idx_invoices_clinic_status; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_invoices_clinic_status ON public.invoices USING btree (clinic_id, status);


--
-- Name: idx_medical_records_patient; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_medical_records_patient ON public.medical_records USING btree (patient_id);


--
-- Name: idx_medications_doctor; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_medications_doctor ON public.medications USING btree (doctor_id);


--
-- Name: idx_messages_clinic_date; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_messages_clinic_date ON public.messages USING btree (clinic_id, message_date);


--
-- Name: idx_patient_attachments_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_attachments_category ON public.patient_attachments USING btree (category);


--
-- Name: idx_patient_attachments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_attachments_created_at ON public.patient_attachments USING btree (created_at);


--
-- Name: idx_patient_attachments_patient_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_patient_attachments_patient_id ON public.patient_attachments USING btree (patient_id);


--
-- Name: idx_patients_cedula; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_patients_cedula ON public.patients USING btree (cedula);


--
-- Name: idx_patients_clinic_id; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_patients_clinic_id ON public.patients USING btree (clinic_id);


--
-- Name: idx_patients_email; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_patients_email ON public.patients USING btree (email);


--
-- Name: idx_prescriptions_patient; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_prescriptions_patient ON public.prescriptions USING btree (patient_id);


--
-- Name: idx_services_clinic; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_services_clinic ON public.medical_services USING btree (clinic_id);


--
-- Name: idx_system_settings_clinic_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_settings_clinic_id ON public.system_settings USING btree (clinic_id);


--
-- Name: idx_system_settings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_settings_user_id ON public.system_settings USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: acarrasco
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: clinics update_clinics_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: laboratory_integrations update_laboratory_integrations_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_laboratory_integrations_updated_at BEFORE UPDATE ON public.laboratory_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medical_records update_medical_records_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medical_references update_medical_references_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_medical_references_updated_at BEFORE UPDATE ON public.medical_references FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medical_services update_medical_services_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_medical_services_updated_at BEFORE UPDATE ON public.medical_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medications update_medications_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: patients update_patients_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: prescriptions update_prescriptions_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_settings update_system_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: acarrasco
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: analytics analytics_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: clinics clinics_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.clinics
    ADD CONSTRAINT clinics_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: email_communications email_communications_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_communications
    ADD CONSTRAINT email_communications_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: email_communications email_communications_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_communications
    ADD CONSTRAINT email_communications_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: email_communications email_communications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_communications
    ADD CONSTRAINT email_communications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: email_templates email_templates_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: invoice_insurance invoice_insurance_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_insurance
    ADD CONSTRAINT invoice_insurance_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_insurance invoice_insurance_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_insurance
    ADD CONSTRAINT invoice_insurance_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.medical_services(id);


--
-- Name: invoices invoices_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: laboratory_integrations laboratory_integrations_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.laboratory_integrations
    ADD CONSTRAINT laboratory_integrations_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: medical_record_attachments medical_record_attachments_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_record_attachments
    ADD CONSTRAINT medical_record_attachments_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) ON DELETE CASCADE;


--
-- Name: medical_records medical_records_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: medical_records medical_records_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: medical_references medical_references_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: medical_references medical_references_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medical_references medical_references_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: medical_services medical_services_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medical_services
    ADD CONSTRAINT medical_services_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: medications medications_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_responses message_responses_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.message_responses
    ADD CONSTRAINT message_responses_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_responses message_responses_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.message_responses
    ADD CONSTRAINT message_responses_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: messages messages_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: messages messages_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: patient_attachments patient_attachments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_attachments
    ADD CONSTRAINT patient_attachments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patients patients_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: prescription_medications prescription_medications_medication_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescription_medications
    ADD CONSTRAINT prescription_medications_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE CASCADE;


--
-- Name: prescription_medications prescription_medications_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescription_medications
    ADD CONSTRAINT prescription_medications_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: report_templates report_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.report_templates
    ADD CONSTRAINT report_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: reports reports_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id);


--
-- Name: reports reports_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.users(id);


--
-- Name: system_settings system_settings_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: system_settings system_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_clinics user_clinics_clinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT user_clinics_clinic_id_fkey FOREIGN KEY (clinic_id) REFERENCES public.clinics(id) ON DELETE CASCADE;


--
-- Name: user_clinics user_clinics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: acarrasco
--

ALTER TABLE ONLY public.user_clinics
    ADD CONSTRAINT user_clinics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: TABLE patient_attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.patient_attachments TO acarrasco;


--
-- PostgreSQL database dump complete
--

