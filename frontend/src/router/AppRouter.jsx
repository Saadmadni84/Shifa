import { Routes, Route } from 'react-router-dom'
import Landing from '../pages/Landing'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/doctor/Dashboard'
import NewVisit from '../pages/doctor/NewVisit'
import VisitScribe from '../pages/doctor/VisitScribe'
import PatientList from '../pages/doctor/PatientList'
import VisitSummary from '../pages/patient/VisitSummary'
import MyHealth from '../pages/patient/MyHealth'
import Vitals from '../pages/patient/Vitals'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/doctor/dashboard" element={<Dashboard />} />
      <Route path="/doctor/new-visit" element={<NewVisit />} />
      <Route path="/doctor/visit-scribe" element={<VisitScribe />} />
      <Route path="/doctor/patients" element={<PatientList />} />
      <Route path="/patient/visit-summary" element={<VisitSummary />} />
      <Route path="/patient/my-health" element={<MyHealth />} />
      <Route path="/patient/vitals" element={<Vitals />} />
    </Routes>
  )
}
