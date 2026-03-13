# Doctor API Routes
# ════════════════════════════════════════════════════════════════════════
#  Shifa — Doctor API Route Reference
#  Add these to your Spring Security config / SecurityFilterChain
# ════════════════════════════════════════════════════════════════════════

# All doctor endpoints require ROLE_DOCTOR
# Demo mode: pass header X-Demo-Mode: true to get demo data without DB

## ── Spring Security config snippet ──────────────────────────────────────
## In your SecurityConfig.java, add these permit rules or role guards:
##
##   .requestMatchers("/api/v1/doctor/**").hasRole("DOCTOR")
##   .requestMatchers("/api/v1/demo/**").permitAll()
##
## ── CORS config ───────────────────────────────────────────────────────
## Allow localhost:5173 (Vite dev server) in development:
##   allowedOrigins: http://localhost:5173
##   allowedMethods: GET, POST, PUT, PATCH, DELETE, OPTIONS
##   allowedHeaders: *
##   allowCredentials: true

# ════════════════════════════════════════════════════════════════════════
#  API ENDPOINTS
# ════════════════════════════════════════════════════════════════════════

GET  /api/v1/doctor/dashboard
     → DashboardResponseDto { doctor, stats, alerts[], recentPatients[] }
     Header: X-Demo-Mode: true  (skips DB, returns demo data)

GET  /api/v1/doctor/patients
     → List<PatientSummaryDto>
     Params: q, status, page, size
     Header: X-Demo-Mode: true

GET  /api/v1/doctor/patients/{patientId}
     → PatientSummaryDto (full detail with conditions + medications)
     Header: X-Demo-Mode: true

GET  /api/v1/doctor/patients/{patientId}/visits
     → List<VisitDetailDto>
     Header: X-Demo-Mode: true

GET  /api/v1/doctor/patients/{patientId}/visits/{visitId}
     → VisitDetailDto (full detail with prescriptions + whatsapp summary)
     Header: X-Demo-Mode: true

GET  /api/v1/doctor/visits
     → List<VisitDetailDto> (all patients, sorted by date desc)
     Params: q, page, size
     Header: X-Demo-Mode: true

# ════════════════════════════════════════════════════════════════════════
#  DEMO LOGIN ENDPOINT (for "Sign in as Doctor" button)
# ════════════════════════════════════════════════════════════════════════

POST /api/v1/auth/demo-doctor
     Body: { "role": "doctor" }
     Response: { "token": "...", "doctorId": "d1", "redirectTo": "/demo/doctor/d1" }

     Implementation in AuthController.java:
     - Creates a short-lived JWT with ROLE_DOCTOR claim
     - Sets X-Demo-Mode in session
     - Returns redirect URL to /demo/doctor/d1

# ════════════════════════════════════════════════════════════════════════
#  FRONTEND NAVIGATION FLOW (summary)
# ════════════════════════════════════════════════════════════════════════

#  Login page → "Sign in as Doctor"
#    → navigate("/demo/doctor/d1")
#    → DashboardPage: calls GET /api/v1/doctor/dashboard?X-Demo-Mode=true
#
#  Dashboard → click patient row
#    → navigate("/demo/doctor/d1/patient/p1")
#    → PatientProfilePage: calls GET /patients/p1 + GET /patients/p1/visits
#
#  Patient Profile → click visit row
#    → navigate("/demo/doctor/d1/patient/p1/visit/v1-1")
#    → VisitDetailPage: calls GET /patients/p1/visits/v1-1
#
#  Sidebar → Patients
#    → navigate("/demo/doctor/d1/patients")
#    → PatientsPage: calls GET /patients (all)
#
#  Sidebar → Visits
#    → navigate("/demo/doctor/d1/visits")
#    → VisitsPage: calls GET /visits (all, across all patients)

