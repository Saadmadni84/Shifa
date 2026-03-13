// StatusBadge Component
// src/components/doctor/StatusBadge.jsx

const STATUS_STYLES = {
  alert:  { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5", dot: "#ef4444" },
  review: { bg: "#fffbeb", text: "#d97706", border: "#fcd34d", dot: "#f59e0b" },
  stable: { bg: "#f0fdf4", text: "#15803d", border: "#86efac", dot: "#22c55e" },
};

export function StatusBadge({ status = "stable", size = "sm" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.stable;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`,
      fontSize, fontWeight: 600, color: s.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

export function WhatsAppBadge({ status, language }) {
  const color = status === "Read" ? "#10b981" : status === "Delivered" ? "#3b82f6" : "#9ca3af";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 20,
      background: `${color}15`, border: `1px solid ${color}40`,
      fontSize: 11, fontWeight: 600, color,
    }}>
      <span style={{ fontSize: 12 }}>📱</span>
      {language} summary {status}
    </span>
  );
}

export function VitalChip({ label, value, highlight = false }) {
  return (
    <div style={{
      padding: "8px 14px", borderRadius: 10,
      background: highlight ? "#fef2f2" : "#f9fafb",
      border: `1px solid ${highlight ? "#fca5a5" : "#e5e7eb"}`,
    }}>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: highlight ? "#dc2626" : "#111" }}>{value}</div>
    </div>
  );
}

