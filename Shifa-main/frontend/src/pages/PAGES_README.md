# Shifa — `src/pages/` Complete Reference

## Folder Structure

```
src/pages/
│
├── LandingPage.jsx          ← / (public marketing)
├── LoginPage.jsx            ← /login (doctor sign-in)
├── RegisterPage.jsx         ← /register (doctor signup, 3-step)
├── NotFoundPage.jsx         ← * (404 fallback)
├── index.js                 ← barrel export
│
├── portal/                  ← Patient-facing (NO auth, token-based)
│   ├── PatientPortalPage.jsx   /portal/:token
│   └── PatientChatPage.jsx     /portal/:token/chat
│
└── doctor/                  ← Doctor-facing (requires DOCTOR role JWT)
    ├── DashboardPage.jsx       /doctor/dashboard
    ├── NewVisitPage.jsx        /doctor/visits/new
    ├── VisitDetailPage.jsx     /doctor/visits/:id
    ├── PatientsPage.jsx        /doctor/patients
    ├── PatientDetailPage.jsx   /doctor/patients/:id
    └── ProfilePage.jsx         /doctor/profile
```

---

## Page Summaries

### Public Pages

| Page | Route | Purpose |
|------|-------|---------|
| `LandingPage` | `/` | Marketing homepage. Redirects logged-in users to dashboard. Features: hero, language marquee, features grid, how-it-works, testimonials, CTA. |
| `LoginPage` | `/login` | Doctor sign-in. Split layout (left: feature list, right: form). Shows session-expired banner from router state. Delegates to `LoginForm` component. |
| `RegisterPage` | `/register` | Doctor registration. 3-step UI: (1) personal details, (2) clinic info, (3) success. Delegates to `DoctorRegisterForm`. |
| `NotFoundPage` | `*` | Clean 404 with back + home buttons. |

### Patient Portal Pages (Token-based, no auth)

| Page | Route | Purpose |
|------|-------|---------|
| `PatientPortalPage` | `/portal/:token` | Full visit summary for the patient. Mobile-first. Language switcher (12 Indian languages), diagnosis, medicines, red flags, diet, follow-up, chat CTA. Handles 404 (not found) and 410 (expired) token states. |
| `PatientChatPage` | `/portal/:token/chat` | WhatsApp-style AI chat. Patient asks follow-up questions in their language. Suggested question chips. Auto-scroll. Typing indicator. |

### Doctor Portal Pages (JWT + DOCTOR role)

| Page | Route | Purpose |
|------|-------|---------|
| `DashboardPage` | `/doctor/dashboard` | Home screen. Stats grid, quick action cards (new visit, add patient, all patients), recent visits list. Modals: add patient, search patient. |
| `NewVisitPage` | `/doctor/visits/new` | 2-step visit creation: (1) select/add patient, (2) fill SOAP form. Redirects to VisitDetailPage after AI processing begins. |
| `VisitDetailPage` | `/doctor/visits/:id` | Most complex page. 4 tabs: AI Summary, SOAP Notes, Attachments, Patient Chat. AI processing banner. Send-to-WhatsApp modal. AI summary review and editing. |
| `PatientsPage` | `/doctor/patients` | Patient list with search (debounced), language filter, infinite scroll. Patient cards. Add patient modal. |
| `PatientDetailPage` | `/doctor/patients/:id` | Full patient profile. 4 tabs: Overview (details + vitals), Visits (history), Vitals (charts), Consents. New visit shortcut. |
| `ProfilePage` | `/doctor/profile` | Doctor settings. 4 tabs: Profile (edit personal + clinic info), Preferences (language, notifications, auto-send), Security (password, logout), Account (export, delete). |

---

## Key Design Decisions

### Patient Portal (mobile-first)
- **No login** — patients tap a WhatsApp link and immediately see their summary
- **Language switcher** calls the backend to get a pre-generated translation
- **RTL support** for Urdu (`dir="rtl"`)
- **Chat page** uses WhatsApp-style bubbles (familiar UX for Indian users)
- **Suggested questions** in the patient's language to reduce friction

### Doctor Portal
- All pages use `DoctorLayout` (sidebar + topbar)
- `PageHeader` provides consistent title, subtitle, back button, and action slot
- All data via React Query hooks (`useVisit`, `usePatients`, etc.)
- Modal pattern for quick actions (add patient, send to WhatsApp) to avoid page navigation

### Auth
- `LoginPage` / `RegisterPage` redirect already-authenticated users
- `ProtectedRoute` in `App.jsx` handles unauthenticated access to doctor routes
- `PatientPortalPage` has **no** auth — token validated by backend

---

## API Dependencies per Page

| Page | API Calls |
|------|-----------|
| `DashboardPage` | `GET /doctors/me/stats`, `GET /visits?limit=10` |
| `NewVisitPage` | `GET /patients?search=`, `POST /patients`, `POST /visits` |
| `VisitDetailPage` | `GET /visits/:id` (polled), `PUT /visits/:id`, `POST /visits/:id/send`, `POST /visits/:id/process` |
| `PatientsPage` | `GET /patients?search=&page=`, `POST /patients` |
| `PatientDetailPage` | `GET /patients/:id`, `GET /patients/:id/visits` |
| `ProfilePage` | `GET /doctors/me`, `PUT /doctors/me` |
| `PatientPortalPage` | `GET /public/visits/:token`, `GET /public/visits/:token?lang=` |
| `PatientChatPage` | `GET /public/visits/:token`, `POST /public/visits/:token/ask` |
