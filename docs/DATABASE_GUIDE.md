# SHIFA — Complete Database Guide

PostgreSQL 15 + Flyway + JPA/Hibernate + Redis design reference for Shifa.

## 1) Architecture Baseline
- Engine: PostgreSQL 15
- Migrations: Flyway (`backend/src/main/resources/db/migration`)
- ORM: Spring Data JPA / Hibernate 6
- Soft delete: `deleted` on major tables
- Audit timestamps: `created_at`, `updated_at`
- JSONB: `visits.ai_summary` with GIN index
- Full-text-like name search: `pg_trgm` indexes

## 2) Migration Inventory (Implemented)
- `V1__create_users.sql`: extensions + enum types
- `V2__create_patients.sql`: `users`, `refresh_tokens`
- `V3__create_visits.sql`: `doctors`
- `V4__create_prescriptions.sql`: `patients`, child relation tables
- `V5__create_notifications.sql`: `visits`, `visit_patient_summaries`
- `V6__create_clinical_tables.sql`: `vital_signs`, `conditions`
- `V7__create_prescriptions_and_medications.sql`: `prescriptions`, `medications`
- `V8__create_notifications_and_whatsapp_log.sql`: `notifications`, `whatsapp_message_log`
- `V9__create_compliance_tables.sql`: `patient_consents`, `audit_logs` (+ immutable rules)
- `V10__create_document_tables.sql`: `uploaded_documents`, `ocr_results`
- `V11__updated_at_triggers.sql`: shared `updated_at` trigger function + triggers
- `V12__seed_reference_data.sql`: `icd_reference` + top ICD seeds

## 3) Table Catalogue (20)
### Identity/Auth
1. `users`
2. `refresh_tokens`

### Core People
3. `doctors`
4. `patients`
5. `patient_allergies`
6. `patient_chronic_conditions`
7. `patient_doctors`

### Visit/Clinical
8. `visits`
9. `visit_patient_summaries`
10. `conditions`
11. `vital_signs`

### Prescription
12. `prescriptions`
13. `medications`

### Comms
14. `notifications`
15. `whatsapp_message_log`

### Compliance/Security
16. `patient_consents`
17. `audit_logs`

### Documents/OCR
18. `uploaded_documents`
19. `ocr_results`

### Metadata
20. `icd_reference`

## 4) Key Design Choices
- UUID primary keys (`uuid_generate_v4()`) on all major tables.
- Partial indexes for soft-delete tables (`WHERE deleted = FALSE`).
- JSONB (`visits.ai_summary`) to support evolving AI schema.
- Append-only audit via DB rules (`no_update_audit`, `no_delete_audit`).
- Generated BMI column in `vital_signs`.

## 5) JSONB Pattern (AI Summary)
`visits.ai_summary` stores structured diagnosis/medication/diet/red-flag output from AI.

Example query patterns:
```sql
SELECT id FROM visits
WHERE ai_summary @> '{"icdCode": "E11"}'::jsonb
AND deleted = false;

SELECT id FROM visits
WHERE (ai_summary->>'confidenceScore')::float > 0.90
AND deleted = false;
```

## 6) Redis Schema (Recommended)
Key format: `shifa:{category}:{identifier}:{sub}`

- OTP: `shifa:otp:{phone}` (TTL 5m)
- OTP attempts: `shifa:otp:attempts:{phone}` (TTL 15m)
- JWT blocklist: `shifa:jwt:blocklist:{jti}` (TTL 24h)
- Rate limit: `shifa:ratelimit:{action}:{id}:{bucket}`
- Patient cache: `shifa:patient:profile:{patientId}` (TTL 10m)
- Portal cache: `shifa:visit:portal:{token}` (TTL 30m)
- AI status: `shifa:ai:processing:{visitId}` (TTL 2m)

## 7) Production Configuration (Implemented)
- `backend/src/main/resources/application-prod.yml`
  - Hikari pool tuning
  - PostgreSQL SSL (`sslmode: require`)
  - `ddl-auto: validate`
  - Flyway validation enabled
- `backend/src/main/java/com/shifa/config/RedisConfig.java`
  - `RedisTemplate<String,Object>` with JSON serialization
  - cache manager with TTL profiles (`patients`, `doctors`, `languages`)

## 8) Flyway Rules
1. Never edit historical migrations after they run in shared envs.
2. Prefer additive changes (new columns/tables/indexes).
3. Keep destructive change as phased migrations.
4. Validate checksums in CI/CD before deploy.

## 9) Operational Notes
- Create indexes for high-volume paths first:
  - `visits(patient_portal_token)`
  - `visits(doctor_id, visit_date desc)`
  - `patients(phone_number)`
- Monitor with `pg_stat_user_indexes` for scan counts and index bloat.
- Run PITR restore drills monthly in staging.
