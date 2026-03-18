--
-- PostgreSQL database dump
--

\restrict TmUgtJcdy3VxrGZVccDAhGktEmPGFzGIbvV3sjTTwUFveQiA9cjQeeBgCkAJegO

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 14.19 (Homebrew)

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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    user_role character varying(255) NOT NULL,
    action_type character varying(255) NOT NULL,
    resource_type character varying(255) NOT NULL,
    resource_id uuid NOT NULL,
    success boolean NOT NULL,
    ip_address character varying(255) NOT NULL,
    session_id uuid NOT NULL,
    phi_accessed boolean NOT NULL,
    phi_elements jsonb,
    accessed_at timestamp(0) without time zone NOT NULL,
    CONSTRAINT audit_logs_action_type_check CHECK (((action_type)::text = ANY ((ARRAY['create'::character varying, 'read'::character varying, 'update'::character varying, 'delete'::character varying, 'download'::character varying, 'export'::character varying, 'login'::character varying, 'logout'::character varying])::text[])))
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    sender_type character varying(255) NOT NULL,
    message_text text NOT NULL,
    referenced_entities jsonb,
    extracted_entities jsonb,
    ai_model_used character varying(255),
    ai_prompt_tokens integer,
    ai_completion_tokens integer,
    created_at timestamp(0) without time zone,
    CONSTRAINT chat_messages_sender_type_check CHECK (((sender_type)::text = ANY ((ARRAY['patient'::character varying, 'ai'::character varying, 'doctor'::character varying, 'system'::character varying])::text[])))
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_sessions (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    visit_id uuid NOT NULL,
    topic character varying(255),
    status character varying(255) NOT NULL,
    initiated_at timestamp(0) without time zone NOT NULL,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    CONSTRAINT chat_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'escalated'::character varying])::text[])))
);


ALTER TABLE public.chat_sessions OWNER TO postgres;

--
-- Name: conditions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conditions (
    id uuid NOT NULL,
    fhir_condition_id character varying(255) NOT NULL,
    patient_id uuid NOT NULL,
    visit_id uuid,
    code_system character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    code_display character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    clinical_status character varying(255) NOT NULL,
    verification_status character varying(255) NOT NULL,
    severity character varying(255),
    onset_date date,
    abatement_date date,
    clinical_notes text,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT conditions_category_check CHECK (((category)::text = ANY ((ARRAY['problem-list-item'::character varying, 'encounter-diagnosis'::character varying, 'chief-complaint'::character varying])::text[]))),
    CONSTRAINT conditions_clinical_status_check CHECK (((clinical_status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'resolved'::character varying, 'remission'::character varying])::text[]))),
    CONSTRAINT conditions_code_system_check CHECK (((code_system)::text = ANY ((ARRAY['ICD-10-CM'::character varying, 'SNOMED-CT'::character varying, 'ICD-11'::character varying])::text[]))),
    CONSTRAINT conditions_severity_check CHECK (((severity)::text = ANY ((ARRAY['mild'::character varying, 'moderate'::character varying, 'severe'::character varying])::text[]))),
    CONSTRAINT conditions_verification_status_check CHECK (((verification_status)::text = ANY ((ARRAY['unconfirmed'::character varying, 'provisional'::character varying, 'confirmed'::character varying, 'refuted'::character varying])::text[])))
);


ALTER TABLE public.conditions OWNER TO postgres;

--
-- Name: consents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consents (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    consent_type character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    consented_at timestamp(0) without time zone NOT NULL,
    withdrawn_at timestamp(0) without time zone,
    expires_at date,
    version character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    CONSTRAINT consents_consent_type_check CHECK (((consent_type)::text = ANY ((ARRAY['privacy'::character varying, 'data_sharing'::character varying, 'research'::character varying, 'telehealth'::character varying, 'recording'::character varying])::text[]))),
    CONSTRAINT consents_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'withdrawn'::character varying, 'expired'::character varying])::text[])))
);


ALTER TABLE public.consents OWNER TO postgres;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id uuid NOT NULL,
    fhir_document_reference_id character varying(255) NOT NULL,
    patient_id uuid NOT NULL,
    visit_id uuid,
    title character varying(255) NOT NULL,
    description text,
    document_type character varying(50) NOT NULL,
    content_type character varying(50) NOT NULL,
    file_path character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    file_hash character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    document_date date NOT NULL,
    confidentiality_level character varying(255) NOT NULL,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    retention_until date,
    ai_analysis jsonb,
    analysis_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    analyzed_at timestamp(0) without time zone,
    analysis_error text,
    CONSTRAINT documents_confidentiality_level_check CHECK (((confidentiality_level)::text = ANY ((ARRAY['U'::character varying, 'L'::character varying, 'M'::character varying, 'H'::character varying, 'R'::character varying])::text[]))),
    CONSTRAINT documents_status_check CHECK (((status)::text = ANY ((ARRAY['current'::character varying, 'superseded'::character varying, 'entered-in-error'::character varying])::text[])))
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.failed_jobs_id_seq OWNER TO postgres;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.jobs_id_seq OWNER TO postgres;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: library_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.library_items (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    source_type character varying(30) NOT NULL,
    source_url character varying(255),
    file_path character varying(255),
    file_size bigint,
    file_hash character varying(64),
    content_type character varying(50),
    content_text text,
    ai_analysis jsonb,
    processing_status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    processing_error text,
    processed_at timestamp(0) without time zone,
    is_personal_use_only boolean DEFAULT true NOT NULL,
    copyright_notice text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.library_items OWNER TO postgres;

--
-- Name: medical_references; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_references (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    authors character varying(255),
    journal character varying(255),
    year integer NOT NULL,
    doi character varying(255),
    pmid character varying(255),
    url character varying(255),
    source_organization character varying(255),
    category character varying(255) NOT NULL,
    specialty character varying(255),
    summary text,
    verified boolean DEFAULT false NOT NULL,
    verified_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.medical_references OWNER TO postgres;

--
-- Name: medication_interactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medication_interactions (
    id uuid NOT NULL,
    drug_a_id uuid NOT NULL,
    drug_b_id uuid NOT NULL,
    severity character varying(255) NOT NULL,
    description text NOT NULL,
    management text NOT NULL,
    source_database character varying(255) NOT NULL,
    should_alert boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    CONSTRAINT medication_interactions_severity_check CHECK (((severity)::text = ANY ((ARRAY['minor'::character varying, 'moderate'::character varying, 'major'::character varying, 'contraindicated'::character varying])::text[]))),
    CONSTRAINT medication_interactions_source_database_check CHECK (((source_database)::text = ANY ((ARRAY['drugbank'::character varying, 'rxnorm'::character varying, 'fda'::character varying, 'local'::character varying])::text[])))
);


ALTER TABLE public.medication_interactions OWNER TO postgres;

--
-- Name: medications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medications (
    id uuid NOT NULL,
    rxnorm_code character varying(255) NOT NULL,
    atc_code character varying(255),
    ndc_code character varying(255),
    generic_name character varying(255) NOT NULL,
    brand_names jsonb,
    display_name character varying(255) NOT NULL,
    form character varying(255) NOT NULL,
    strength_value numeric(10,4) NOT NULL,
    strength_unit character varying(255) NOT NULL,
    ingredients jsonb,
    black_box_warning boolean DEFAULT false NOT NULL,
    pregnancy_category character varying(255),
    source character varying(255) NOT NULL,
    source_last_updated timestamp(0) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT medications_source_check CHECK (((source)::text = ANY ((ARRAY['rxnorm'::character varying, 'drugbank'::character varying, 'local'::character varying])::text[])))
);


ALTER TABLE public.medications OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    visit_id uuid,
    type character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    body text NOT NULL,
    data jsonb,
    read_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: observations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.observations (
    id uuid NOT NULL,
    fhir_observation_id character varying(255) NOT NULL,
    patient_id uuid NOT NULL,
    visit_id uuid,
    practitioner_id uuid,
    code_system character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    code_display character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    value_type character varying(255) NOT NULL,
    value_quantity numeric(12,4),
    value_unit character varying(255),
    value_string text,
    value_boolean boolean,
    reference_range_low numeric(12,4),
    reference_range_high numeric(12,4),
    reference_range_text text,
    interpretation character varying(255),
    effective_date date NOT NULL,
    issued_at timestamp(0) without time zone,
    specialty_data jsonb,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT observations_code_system_check CHECK (((code_system)::text = ANY ((ARRAY['LOINC'::character varying, 'SNOMED-CT'::character varying, 'LOCAL'::character varying])::text[]))),
    CONSTRAINT observations_interpretation_check CHECK (((interpretation)::text = ANY ((ARRAY['L'::character varying, 'LL'::character varying, 'H'::character varying, 'HH'::character varying, 'N'::character varying])::text[]))),
    CONSTRAINT observations_status_check CHECK (((status)::text = ANY ((ARRAY['registered'::character varying, 'preliminary'::character varying, 'final'::character varying, 'amended'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT observations_value_type_check CHECK (((value_type)::text = ANY ((ARRAY['quantity'::character varying, 'string'::character varying, 'boolean'::character varying, 'codeable'::character varying])::text[])))
);


ALTER TABLE public.observations OWNER TO postgres;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255),
    address text,
    phone character varying(255),
    email character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.organizations OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: patient_context_summaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_context_summaries (
    id uuid NOT NULL,
    patient_id uuid NOT NULL,
    visit_id uuid,
    session_id uuid,
    summary_text text NOT NULL,
    key_questions jsonb DEFAULT '[]'::jsonb NOT NULL,
    concerns_raised jsonb DEFAULT '[]'::jsonb NOT NULL,
    followup_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    emotional_context text,
    token_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.patient_context_summaries OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id uuid NOT NULL,
    fhir_patient_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    dob date NOT NULL,
    gender character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    preferred_language character varying(255) DEFAULT 'en'::character varying NOT NULL,
    timezone character varying(255) DEFAULT 'UTC'::character varying NOT NULL,
    mrn character varying(255) NOT NULL,
    ssn_encrypted character varying(255),
    consent_given boolean DEFAULT false NOT NULL,
    consent_date timestamp(0) without time zone,
    data_sharing_consent boolean DEFAULT false NOT NULL,
    right_to_erasure_requested boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    height_cm numeric(5,1),
    weight_kg numeric(5,1),
    blood_type character varying(5),
    allergies jsonb,
    emergency_contact_name character varying(255),
    emergency_contact_phone character varying(255),
    emergency_contact_relationship character varying(255),
    CONSTRAINT patients_gender_check CHECK (((gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying, 'unknown'::character varying])::text[])))
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: practitioners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.practitioners (
    id uuid NOT NULL,
    fhir_practitioner_id character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255),
    npi character varying(255),
    license_number character varying(255),
    medical_degree character varying(255),
    primary_specialty character varying(255) NOT NULL,
    secondary_specialties jsonb,
    organization_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.practitioners OWNER TO postgres;

--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id uuid NOT NULL,
    fhir_medication_request_id character varying(255) NOT NULL,
    patient_id uuid NOT NULL,
    practitioner_id uuid NOT NULL,
    visit_id uuid,
    medication_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    intent character varying(255) NOT NULL,
    dose_quantity numeric(10,4) NOT NULL,
    dose_unit character varying(255) NOT NULL,
    frequency character varying(255) NOT NULL,
    frequency_text character varying(255),
    route character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date,
    duration_days integer,
    number_of_refills integer DEFAULT 0 NOT NULL,
    refills_remaining integer DEFAULT 0 NOT NULL,
    special_instructions text,
    indication character varying(255),
    indication_code character varying(255),
    substitution_allowed boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT prescriptions_intent_check CHECK (((intent)::text = ANY ((ARRAY['order'::character varying, 'plan'::character varying, 'proposal'::character varying])::text[]))),
    CONSTRAINT prescriptions_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'on-hold'::character varying, 'completed'::character varying, 'stopped'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: transcripts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transcripts (
    id uuid NOT NULL,
    visit_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    source_type character varying(255) NOT NULL,
    stt_provider character varying(255) NOT NULL,
    audio_duration_seconds integer NOT NULL,
    audio_file_path character varying(255),
    raw_transcript text,
    diarized_transcript jsonb,
    entities_extracted jsonb,
    soap_note jsonb,
    summary text,
    processing_status character varying(255) NOT NULL,
    patient_consent_given boolean NOT NULL,
    consent_timestamp timestamp(0) without time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT transcripts_processing_status_check CHECK (((processing_status)::text = ANY ((ARRAY['pending'::character varying, 'transcribing'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'insufficient_content'::character varying])::text[]))),
    CONSTRAINT transcripts_source_type_check CHECK (((source_type)::text = ANY ((ARRAY['ambient_phone'::character varying, 'ambient_device'::character varying, 'manual_upload'::character varying])::text[])))
);


ALTER TABLE public.transcripts OWNER TO postgres;

--
-- Name: upload_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.upload_tokens (
    id uuid NOT NULL,
    token character varying(64) NOT NULL,
    visit_id uuid NOT NULL,
    created_by uuid NOT NULL,
    expires_at timestamp(0) without time zone NOT NULL,
    used_at timestamp(0) without time zone,
    document_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.upload_tokens OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    patient_id uuid,
    practitioner_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    demo_scenario_key character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['patient'::character varying, 'doctor'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: visit_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visit_notes (
    id uuid NOT NULL,
    visit_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    author_practitioner_id uuid NOT NULL,
    composition_type character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    chief_complaint text,
    history_of_present_illness text,
    review_of_systems text,
    physical_exam text,
    assessment text,
    assessment_codes jsonb,
    plan text,
    follow_up text,
    follow_up_timeframe character varying(255),
    additional_sections jsonb,
    is_signed boolean DEFAULT false NOT NULL,
    signed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    medical_terms jsonb,
    CONSTRAINT visit_notes_composition_type_check CHECK (((composition_type)::text = ANY ((ARRAY['progress_note'::character varying, 'discharge_summary'::character varying, 'clinic_note'::character varying])::text[]))),
    CONSTRAINT visit_notes_status_check CHECK (((status)::text = ANY ((ARRAY['preliminary'::character varying, 'final'::character varying, 'amended'::character varying])::text[])))
);


ALTER TABLE public.visit_notes OWNER TO postgres;

--
-- Name: visits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visits (
    id uuid NOT NULL,
    fhir_encounter_id character varying(255) NOT NULL,
    patient_id uuid NOT NULL,
    practitioner_id uuid NOT NULL,
    organization_id uuid,
    visit_type character varying(255) NOT NULL,
    class character varying(255) NOT NULL,
    visit_status character varying(255) NOT NULL,
    service_type character varying(255),
    reason_for_visit text,
    reason_codes jsonb,
    summary text,
    started_at timestamp(0) without time zone,
    ended_at timestamp(0) without time zone,
    duration_minutes integer,
    provider_notes_followup text,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT visits_visit_status_check CHECK (((visit_status)::text = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))),
    CONSTRAINT visits_visit_type_check CHECK (((visit_type)::text = ANY ((ARRAY['office_visit'::character varying, 'telehealth'::character varying, 'emergency'::character varying, 'inpatient'::character varying])::text[])))
);


ALTER TABLE public.visits OWNER TO postgres;

--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, user_role, action_type, resource_type, resource_id, success, ip_address, session_id, phi_accessed, phi_elements, accessed_at) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, session_id, sender_type, message_text, referenced_entities, extracted_entities, ai_model_used, ai_prompt_tokens, ai_completion_tokens, created_at) FROM stdin;
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_sessions (id, patient_id, visit_id, topic, status, initiated_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: conditions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conditions (id, fhir_condition_id, patient_id, visit_id, code_system, code, code_display, category, clinical_status, verification_status, severity, onset_date, abatement_date, clinical_notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: consents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.consents (id, patient_id, consent_type, status, consented_at, withdrawn_at, expires_at, version, created_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, fhir_document_reference_id, patient_id, visit_id, title, description, document_type, content_type, file_path, file_size, file_hash, status, document_date, confidentiality_level, created_by, created_at, updated_at, retention_until, ai_analysis, analysis_status, analyzed_at, analysis_error) FROM stdin;
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- Data for Name: library_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.library_items (id, user_id, title, source_type, source_url, file_path, file_size, file_hash, content_type, content_text, ai_analysis, processing_status, processing_error, processed_at, is_personal_use_only, copyright_notice, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medical_references; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_references (id, title, authors, journal, year, doi, pmid, url, source_organization, category, specialty, summary, verified, verified_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: medication_interactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medication_interactions (id, drug_a_id, drug_b_id, severity, description, management, source_database, should_alert, created_at) FROM stdin;
b7c8f480-9766-4d1b-85e7-4cc68a034e7e	2db4e4f7-9bec-4984-9dca-ae276d3b249d	7478ae19-65c2-4812-9ba9-8977efa6dc4f	major	Severe interaction detected. Avoid combination.	Monitor closely or switch to alternative.	local	t	2026-03-18 19:10:43
\.


--
-- Data for Name: medications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medications (id, rxnorm_code, atc_code, ndc_code, generic_name, brand_names, display_name, form, strength_value, strength_unit, ingredients, black_box_warning, pregnancy_category, source, source_last_updated, is_active, created_at, updated_at) FROM stdin;
2db4e4f7-9bec-4984-9dca-ae276d3b249d	RX001	\N	\N	Paracetamol	\N	Paracetamol 500mg	Tablet	500.0000	mg	\N	f	\N	local	\N	t	\N	\N
7478ae19-65c2-4812-9ba9-8977efa6dc4f	RX002	\N	\N	Aspirin	\N	Aspirin 81mg	Tablet	81.0000	mg	\N	f	\N	local	\N	t	2026-03-18 19:10:27	2026-03-18 19:10:27
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2024_01_01_000001_create_organizations_table	1
2	2024_01_01_000002_create_patients_table	1
3	2024_01_01_000003_create_practitioners_table	1
4	2024_01_01_000004_create_users_table	1
5	2024_01_01_000005_add_created_by_to_patients_table	1
6	2024_01_01_000006_create_visits_table	1
7	2024_01_01_000007_create_observations_table	1
8	2024_01_01_000008_create_conditions_table	1
9	2024_01_01_000009_create_medications_table	1
10	2024_01_01_000010_create_prescriptions_table	1
11	2024_01_01_000011_create_medication_interactions_table	1
12	2024_01_01_000012_create_documents_table	1
13	2024_01_01_000013_create_transcripts_table	1
14	2024_01_01_000014_create_visit_notes_table	1
15	2024_01_01_000015_create_chat_sessions_table	1
16	2024_01_01_000016_create_chat_messages_table	1
17	2024_01_01_000017_create_audit_logs_table	1
18	2024_01_01_000018_create_consents_table	1
19	2024_01_01_000019_create_notifications_table	1
20	2024_01_01_000020_create_personal_access_tokens_table	1
21	2024_01_01_000021_create_cache_table	1
22	2024_01_01_000022_create_jobs_table	1
23	2026_02_11_063940_add_medical_terms_to_visit_notes_table	1
24	2026_02_11_085429_create_medical_references_table	1
25	2026_02_11_115438_expand_document_types_for_patient_uploads	1
26	2026_02_11_121150_add_analysis_fields_to_documents_table	1
27	2026_02_11_141813_add_health_profile_to_patients_table	1
28	2026_02_11_180000_create_upload_tokens_table	1
29	2026_02_11_215358_add_insufficient_content_to_transcripts_processing_status	1
30	2026_02_12_080324_add_demo_scenario_key_to_users_table	1
31	2026_02_12_084531_make_practitioner_fields_nullable	1
32	2026_02_12_093144_make_visits_organization_id_nullable	1
33	2026_02_12_093524_create_library_items_table	1
34	2026_02_13_091021_make_transcripts_support_async_transcription	1
35	2026_02_15_084531_create_patient_context_summaries_table	1
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, visit_id, type, title, body, data, read_at, created_at) FROM stdin;
\.


--
-- Data for Name: observations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.observations (id, fhir_observation_id, patient_id, visit_id, practitioner_id, code_system, code, code_display, category, status, value_type, value_quantity, value_unit, value_string, value_boolean, reference_range_low, reference_range_high, reference_range_text, interpretation, effective_date, issued_at, specialty_data, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organizations (id, name, type, address, phone, email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: patient_context_summaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_context_summaries (id, patient_id, visit_id, session_id, summary_text, key_questions, concerns_raised, followup_items, emotional_context, token_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, fhir_patient_id, first_name, last_name, dob, gender, email, phone, preferred_language, timezone, mrn, ssn_encrypted, consent_given, consent_date, data_sharing_consent, right_to_erasure_requested, created_by, created_at, updated_at, deleted_at, height_cm, weight_kg, blood_type, allergies, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship) FROM stdin;
\.


--
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: practitioners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.practitioners (id, fhir_practitioner_id, first_name, last_name, email, npi, license_number, medical_degree, primary_specialty, secondary_specialties, organization_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, fhir_medication_request_id, patient_id, practitioner_id, visit_id, medication_id, status, intent, dose_quantity, dose_unit, frequency, frequency_text, route, start_date, end_date, duration_days, number_of_refills, refills_remaining, special_instructions, indication, indication_code, substitution_allowed, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: transcripts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transcripts (id, visit_id, patient_id, source_type, stt_provider, audio_duration_seconds, audio_file_path, raw_transcript, diarized_transcript, entities_extracted, soap_note, summary, processing_status, patient_consent_given, consent_timestamp, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: upload_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.upload_tokens (id, token, visit_id, created_by, expires_at, used_at, document_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, email_verified_at, password, role, patient_id, practitioner_id, is_active, last_login_at, remember_token, created_at, updated_at, demo_scenario_key) FROM stdin;
\.


--
-- Data for Name: visit_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visit_notes (id, visit_id, patient_id, author_practitioner_id, composition_type, status, chief_complaint, history_of_present_illness, review_of_systems, physical_exam, assessment, assessment_codes, plan, follow_up, follow_up_timeframe, additional_sections, is_signed, signed_at, created_at, updated_at, medical_terms) FROM stdin;
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visits (id, fhir_encounter_id, patient_id, practitioner_id, organization_id, visit_type, class, visit_status, service_type, reason_for_visit, reason_codes, summary, started_at, ended_at, duration_minutes, provider_notes_followup, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 35, true);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: conditions conditions_fhir_condition_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_fhir_condition_id_unique UNIQUE (fhir_condition_id);


--
-- Name: conditions conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_pkey PRIMARY KEY (id);


--
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- Name: documents documents_fhir_document_reference_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_fhir_document_reference_id_unique UNIQUE (fhir_document_reference_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: library_items library_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library_items
    ADD CONSTRAINT library_items_pkey PRIMARY KEY (id);


--
-- Name: medical_references medical_references_doi_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_doi_unique UNIQUE (doi);


--
-- Name: medical_references medical_references_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_pkey PRIMARY KEY (id);


--
-- Name: medical_references medical_references_pmid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_references
    ADD CONSTRAINT medical_references_pmid_unique UNIQUE (pmid);


--
-- Name: medication_interactions medication_interactions_drug_a_id_drug_b_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication_interactions
    ADD CONSTRAINT medication_interactions_drug_a_id_drug_b_id_unique UNIQUE (drug_a_id, drug_b_id);


--
-- Name: medication_interactions medication_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication_interactions
    ADD CONSTRAINT medication_interactions_pkey PRIMARY KEY (id);


--
-- Name: medications medications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_pkey PRIMARY KEY (id);


--
-- Name: medications medications_rxnorm_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medications
    ADD CONSTRAINT medications_rxnorm_code_unique UNIQUE (rxnorm_code);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: observations observations_fhir_observation_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_fhir_observation_id_unique UNIQUE (fhir_observation_id);


--
-- Name: observations observations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: patient_context_summaries patient_context_summaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_context_summaries
    ADD CONSTRAINT patient_context_summaries_pkey PRIMARY KEY (id);


--
-- Name: patient_context_summaries patient_context_summaries_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_context_summaries
    ADD CONSTRAINT patient_context_summaries_session_id_unique UNIQUE (session_id);


--
-- Name: patients patients_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_email_unique UNIQUE (email);


--
-- Name: patients patients_fhir_patient_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_fhir_patient_id_unique UNIQUE (fhir_patient_id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: practitioners practitioners_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practitioners
    ADD CONSTRAINT practitioners_email_unique UNIQUE (email);


--
-- Name: practitioners practitioners_fhir_practitioner_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practitioners
    ADD CONSTRAINT practitioners_fhir_practitioner_id_unique UNIQUE (fhir_practitioner_id);


--
-- Name: practitioners practitioners_npi_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practitioners
    ADD CONSTRAINT practitioners_npi_unique UNIQUE (npi);


--
-- Name: practitioners practitioners_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practitioners
    ADD CONSTRAINT practitioners_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_fhir_medication_request_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_fhir_medication_request_id_unique UNIQUE (fhir_medication_request_id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: transcripts transcripts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcripts
    ADD CONSTRAINT transcripts_pkey PRIMARY KEY (id);


--
-- Name: upload_tokens upload_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_tokens
    ADD CONSTRAINT upload_tokens_pkey PRIMARY KEY (id);


--
-- Name: upload_tokens upload_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_tokens
    ADD CONSTRAINT upload_tokens_token_unique UNIQUE (token);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: visit_notes visit_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_notes
    ADD CONSTRAINT visit_notes_pkey PRIMARY KEY (id);


--
-- Name: visit_notes visit_notes_visit_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_notes
    ADD CONSTRAINT visit_notes_visit_id_unique UNIQUE (visit_id);


--
-- Name: visits visits_fhir_encounter_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_fhir_encounter_id_unique UNIQUE (fhir_encounter_id);


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_phi_accessed_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_phi_accessed_index ON public.audit_logs USING btree (phi_accessed);


--
-- Name: audit_logs_resource_id_accessed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_resource_id_accessed_at_index ON public.audit_logs USING btree (resource_id, accessed_at);


--
-- Name: audit_logs_user_id_accessed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_id_accessed_at_index ON public.audit_logs USING btree (user_id, accessed_at);


--
-- Name: conditions_code_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conditions_code_index ON public.conditions USING btree (code);


--
-- Name: idx_medication_pair; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_medication_pair ON public.medication_interactions USING btree (drug_a_id, drug_b_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: library_items_user_id_processing_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX library_items_user_id_processing_status_index ON public.library_items USING btree (user_id, processing_status);


--
-- Name: medical_references_category_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_references_category_index ON public.medical_references USING btree (category);


--
-- Name: medical_references_source_organization_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_references_source_organization_index ON public.medical_references USING btree (source_organization);


--
-- Name: medical_references_specialty_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_references_specialty_index ON public.medical_references USING btree (specialty);


--
-- Name: medications_generic_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medications_generic_name_index ON public.medications USING btree (generic_name);


--
-- Name: observations_code_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX observations_code_index ON public.observations USING btree (code);


--
-- Name: patient_context_summaries_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patient_context_summaries_created_at_index ON public.patient_context_summaries USING btree (created_at);


--
-- Name: patient_context_summaries_patient_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patient_context_summaries_patient_id_index ON public.patient_context_summaries USING btree (patient_id);


--
-- Name: patients_mrn_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patients_mrn_index ON public.patients USING btree (mrn);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: audit_logs audit_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_messages chat_messages_session_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_foreign FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id);


--
-- Name: chat_sessions chat_sessions_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: chat_sessions chat_sessions_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: conditions conditions_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: conditions conditions_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: conditions conditions_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conditions
    ADD CONSTRAINT conditions_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: consents consents_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: documents documents_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: documents documents_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: documents documents_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: library_items library_items_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library_items
    ADD CONSTRAINT library_items_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: medication_interactions medication_interactions_drug_a_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication_interactions
    ADD CONSTRAINT medication_interactions_drug_a_id_foreign FOREIGN KEY (drug_a_id) REFERENCES public.medications(id);


--
-- Name: medication_interactions medication_interactions_drug_b_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medication_interactions
    ADD CONSTRAINT medication_interactions_drug_b_id_foreign FOREIGN KEY (drug_b_id) REFERENCES public.medications(id);


--
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: observations observations_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: observations observations_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: observations observations_practitioner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_practitioner_id_foreign FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id);


--
-- Name: observations observations_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.observations
    ADD CONSTRAINT observations_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: patient_context_summaries patient_context_summaries_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_context_summaries
    ADD CONSTRAINT patient_context_summaries_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;


--
-- Name: patient_context_summaries patient_context_summaries_session_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_context_summaries
    ADD CONSTRAINT patient_context_summaries_session_id_foreign FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON DELETE SET NULL;


--
-- Name: patient_context_summaries patient_context_summaries_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_context_summaries
    ADD CONSTRAINT patient_context_summaries_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE SET NULL;


--
-- Name: patients patients_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: practitioners practitioners_organization_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.practitioners
    ADD CONSTRAINT practitioners_organization_id_foreign FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: prescriptions prescriptions_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: prescriptions prescriptions_medication_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_medication_id_foreign FOREIGN KEY (medication_id) REFERENCES public.medications(id);


--
-- Name: prescriptions prescriptions_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: prescriptions prescriptions_practitioner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_practitioner_id_foreign FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id);


--
-- Name: prescriptions prescriptions_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: transcripts transcripts_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcripts
    ADD CONSTRAINT transcripts_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: transcripts transcripts_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transcripts
    ADD CONSTRAINT transcripts_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: upload_tokens upload_tokens_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_tokens
    ADD CONSTRAINT upload_tokens_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: upload_tokens upload_tokens_document_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_tokens
    ADD CONSTRAINT upload_tokens_document_id_foreign FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE SET NULL;


--
-- Name: upload_tokens upload_tokens_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.upload_tokens
    ADD CONSTRAINT upload_tokens_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id) ON DELETE CASCADE;


--
-- Name: users users_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: users users_practitioner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_practitioner_id_foreign FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id);


--
-- Name: visit_notes visit_notes_author_practitioner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_notes
    ADD CONSTRAINT visit_notes_author_practitioner_id_foreign FOREIGN KEY (author_practitioner_id) REFERENCES public.practitioners(id);


--
-- Name: visit_notes visit_notes_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_notes
    ADD CONSTRAINT visit_notes_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: visit_notes visit_notes_visit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visit_notes
    ADD CONSTRAINT visit_notes_visit_id_foreign FOREIGN KEY (visit_id) REFERENCES public.visits(id);


--
-- Name: visits visits_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: visits visits_organization_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_organization_id_foreign FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: visits visits_patient_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_patient_id_foreign FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: visits visits_practitioner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visits
    ADD CONSTRAINT visits_practitioner_id_foreign FOREIGN KEY (practitioner_id) REFERENCES public.practitioners(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TmUgtJcdy3VxrGZVccDAhGktEmPGFzGIbvV3sjTTwUFveQiA9cjQeeBgCkAJegO

