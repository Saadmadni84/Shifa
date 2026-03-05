# Shifa — Demo Module

## What this is

The `demo` package is a fully self-contained backend module that powers the
Shifa frontend demo mode. It requires **zero authentication** and **zero
external API calls** — perfect for hackathon judges, investor demos, and
onboarding new users.

---

## Package Structure

```
backend/src/main/java/com/shifa/
│
├── demo/                          ← DROP THIS IN (new)
│   ├── controller/
│   │   └── DemoController.java   ← All REST endpoints
│   ├── service/
│   │   └── DemoService.java      ← Business logic + AI chat engine
│   ├── dto/
│   │   ├── DemoPatientDTO.java   ← Patient response shape
│   │   ├── DemoDoctorDTO.java    ← Doctor response shape
│   │   ├── DemoVisitDTO.java     ← Full SOAP visit structure
│   │   └── DemoChatDTO.java      ← Chat request + response
│   ├── data/
│   │   └── DemoDataStore.java    ← Static in-memory mock data
│   └── DemoIT.java               ← Integration tests (move to /test/)
│
└── config/
    └── SecurityConfig.java       ← ADD: .requestMatchers("/api/v1/demo/**").permitAll()
```

---

## Demo Patients & Doctors

| # | Patient | Age | Specialty | Language | Doctor |
|---|---------|-----|-----------|----------|--------|
| 1 | Arjun Sharma | 52M | Cardiology (PVCs) | Hindi | Dr. Ananya Krishnan |
| 2 | Priya Patel | 45F | Endocrinology (Diabetes HbA1c 8.2%) | Gujarati | Dr. Suresh Mehta |
| 3 | Ravi Kumar | 38M | Pulmonology (Asthma) | Kannada | Dr. Kavita Rao |

---

## API Endpoints

All endpoints are under `/api/v1/demo/**` — **no JWT required**.

### Patient Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/demo/patients` | List all 3 demo patients |
| `GET` | `/api/v1/demo/patients/{id}` | Full patient profile + visits |
| `GET` | `/api/v1/demo/patients/{id}/visits/{vid}` | Single visit (SOAP + tests + meds) |
| `POST` | `/api/v1/demo/patients/{id}/visits/{vid}/chat` | AI chat (rule-based, no API key needed) |

### Doctor Endpoints
| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/v1/demo/doctors` | List all 3 demo doctors |
| `GET` | `/api/v1/demo/doctors/{id}` | Single doctor profile + stats |
| `GET` | `/api/v1/demo/doctors/{id}/patients` | Doctor's assigned patients |
| `GET` | `/api/v1/demo/doctors/{id}/patients/{pid}/audit` | AI transparency audit trail |

### IDs to use
```
Patients:  pat-001, pat-002, pat-003
Visits:    visit-001-a, visit-002-a, visit-003-a
Doctors:   doc-001, doc-002, doc-003
```

---

## Security Config Change Required

In `SecurityConfig.java`, add this line **before** the `authenticated()` catch-all:

```java
// ★ DEMO — no auth required
.requestMatchers("/api/v1/demo/**").permitAll()
```

The full updated `SecurityConfig.java` is included in this PR.

---

## AI Chat (Demo Mode)

The demo chat uses a **rule-based engine** in `DemoService.chat()`:
- No Anthropic API key needed for demo
- Matches keywords (medicine, diagnosis, test results, emergency, etc.)
- Returns contextual answers from the patient's actual visit data
- Handles Hindi/Gujarati/Kannada mixed-language queries
- Returns a `isDemoMode: true` flag and disclaimer in every response

**To upgrade to real Claude AI:** Replace the `chat()` method body in
`DemoService` with a call to your existing `AnthropicService.streamChat()`.

---

## Running the Tests

```bash
# Run all demo integration tests
mvn test -Dtest=DemoIT

# Run specific test
mvn test -Dtest=DemoIT#chat_returnsContextualResponse
```

---

## Disclaimer

All clinical scenarios, patient data, and medical records are entirely
fictional and created solely for demonstration purposes. All names,
demographics, and medical data do not represent real individuals or real
medical encounters.
