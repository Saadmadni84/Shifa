import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorLayout from "../../components/doctor/DoctorLayout";
import { WhatsAppBadge } from "../../components/doctor/StatusBadge";
import { useDoctorDashboard } from "../../hooks/useDoctorDashboard";
import { DEMO_VISITS, DEMO_PATIENTS } from "../../data/demo/doctorDemoData";

function getAllVisits() {
  return Object.entries(DEMO_VISITS)
    .flatMap(([patientId, visits]) =>
      visits.map((v) => ({
        ...v,
        patient: DEMO_PATIENTS.find((p) => p.id === patientId),
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export default function VisitsPage() {
  const navigate = useNavigate();
  const { doctor } = useDoctorDashboard({ isDemo: true });
  const [search, setSearch] = useState("");
  const allVisits = getAllVisits();

  const filtered = allVisits.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      `${v.patient?.firstName} ${v.patient?.lastName}`.toLowerCase().includes(q) ||
      v.diagnosis?.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q)
    );
  });

  return (
    <DoctorLayout doctor={doctor}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: 0 }}>All Visits</h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>{filtered.length} visits</p>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9ca3af" }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visits…"
            style={{ padding: "9px 14px 9px 36px", borderRadius: 10, fontSize: 14, border: "1.5px solid #e5e7eb", outline: "none", width: 240, background: "#fff" }}
          />
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e8ecf0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {filtered.map((visit, idx) => {
          const d = new Date(visit.date);
          return (
            <div
              key={visit.id}
              onClick={() => navigate(`/demo/doctor/d1/patient/${visit.patientId}/visit/${visit.id}`)}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                borderBottom: idx < filtered.length - 1 ? "1px solid #f5f5f5" : "none",
                cursor: "pointer", transition: "background 0.12s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {/* Date */}
              <div style={{
                width: 44, flexShrink: 0, textAlign: "center",
                background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "5px 4px",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#15803d", textTransform: "uppercase" }}>
                  {d.toLocaleDateString("en-IN", { month: "short" })}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#111", lineHeight: 1 }}>{d.getDate()}</div>
              </div>

              {/* Patient avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0369a1", fontWeight: 700, fontSize: 12,
              }}>
                {visit.patient?.avatar}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 2 }}>
                  {visit.patient?.firstName} {visit.patient?.lastName}, {visit.patient?.age}
                </div>
                <div style={{ fontSize: 13, color: "#374151" }}>{visit.diagnosis}</div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span style={{
                  padding: "2px 10px", borderRadius: 20, background: "#f0fdf4",
                  border: "1px solid #86efac", fontSize: 11, fontWeight: 600, color: "#15803d",
                }}>
                  {visit.type}
                </span>
                {visit.whatsappSummary?.sent && (
                  <WhatsAppBadge status={visit.whatsappSummary.status} language={visit.whatsappSummary.language} />
                )}
              </div>

              <span style={{ fontSize: 18, color: "#d1d5db", flexShrink: 0 }}>›</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No visits found.</div>
        )}
      </div>
    </DoctorLayout>
  );
}

