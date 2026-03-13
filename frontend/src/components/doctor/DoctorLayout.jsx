// DoctorLayout Component
// src/components/doctor/DoctorLayout.jsx
import { NavLink, useNavigate } from "react-router-dom";

const NAV = [
  { label: "Dashboard", to: "/demo/doctor/d1", icon: "⊞" },
  { label: "Patients", to: "/demo/doctor/d1/patients", icon: "👥" },
  { label: "Visits", to: "/demo/doctor/d1/visits", icon: "📋" },
];

export default function DoctorLayout({ children, doctor }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8", fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 240,
          background: "#fff",
          borderRight: "1px solid #e8ecf0",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #e8ecf0", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>✦</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Shifa</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Doctor Panel
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length === 4}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                textDecoration: "none", fontSize: 14, fontWeight: 500,
                color: isActive ? "#059669" : "#374151",
                background: isActive ? "#ecfdf5" : "transparent",
                transition: "all 0.15s",
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Doctor profile + logout */}
        <div style={{ padding: "16px 16px 20px", borderTop: "1px solid #e8ecf0" }}>
          {doctor && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}>
                {doctor.avatar || doctor.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.2 }}>{doctor.name}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Doctor</div>
              </div>
            </div>
          )}
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 8,
              border: "1px solid #e5e7eb", background: "#fff",
              color: "#6b7280", fontSize: 13, cursor: "pointer",
              textAlign: "left",
            }}
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: "32px 40px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

