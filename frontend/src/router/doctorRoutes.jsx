// Doctor Routes
// ═══════════════════════════════════════════════════════════════════════
//  src/router/routes.js  — ADD THESE ROUTES to your existing routes array
// ═══════════════════════════════════════════════════════════════════════
//
//  These are the Shifa Doctor Panel routes triggered by "Sign in as Doctor"
//  All are nested under /demo/doctor/:doctorId  (doctorId = "d1" for demo)
//
//  HOW TO USE:
//  Import these into your existing routes.js and spread them into your
//  routes array, OR add them inside your BrowserRouter / createBrowserRouter.
// ═══════════════════════════════════════════════════════════════════════

import DashboardPage      from "../pages/doctor/DashboardPage";
import PatientsPage       from "../pages/doctor/PatientsPage";
import PatientProfilePage from "../pages/doctor/PatientProfilePage";
import VisitsPage         from "../pages/doctor/VisitsPage";
import VisitDetailPage    from "../pages/doctor/VisitDetailPage";

import NewVisitPage from '../pages/doctor/NewVisitPage';
import ProfilePage from '../pages/doctor/ProfilePage';
export const doctorRoutes = [
  {
    path: '/demo/doctor/:doctorId/visit/new',
    element: <NewVisitPage />
  },
  {
    path: '/demo/doctor/:doctorId/profile',
    element: <ProfilePage />
  },
  {
    // Doctor Dashboard — shown after "Sign in as Doctor"
    path: "/demo/doctor/:doctorId",
    element: <DashboardPage />,
  },
  {
    // Full patient list
    path: "/demo/doctor/:doctorId/patients",
    element: <PatientsPage />,
  },
  {
    // All visits across all patients
    path: "/demo/doctor/:doctorId/visits",
    element: <VisitsPage />,
  },
  {
    // Individual patient profile + visit history
    path: "/demo/doctor/:doctorId/patient/:patientId",
    element: <PatientProfilePage />,
  },
  {
    // Specific visit detail
    path: "/demo/doctor/:doctorId/patient/:patientId/visit/:visitId",
    element: <VisitDetailPage />,
  },
];

// ═══════════════════════════════════════════════════════════════════════
//  src/router/AppRouter.jsx  — MERGE LIKE THIS (example)
// ═══════════════════════════════════════════════════════════════════════
//
//  import { doctorRoutes } from "./routes";          // ← add this
//
//  <Routes>
//    {/* ... your existing routes ... */}
//
//    {/* Doctor panel — demo mode */}
//    {doctorRoutes.map((r) => (
//      <Route key={r.path} path={r.path} element={r.element} />
//    ))}
//  </Routes>
//
// ═══════════════════════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════════════════════
//  src/pages/LoginPage.jsx  — "Sign in as Doctor" button should navigate:
// ═══════════════════════════════════════════════════════════════════════
//
//  const navigate = useNavigate();
//
//  <button onClick={() => navigate("/demo/doctor/d1")}>
//    Sign in as Doctor
//  </button>
//
// ═══════════════════════════════════════════════════════════════════════

