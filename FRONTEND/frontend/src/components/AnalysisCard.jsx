export default function AnalysisCard({ title, children }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e0e0e0",
        borderRadius: "18px",
        padding: "18px",
        minHeight: "120px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "10px", fontSize: "1rem", color: "#111827" }}>
        {title}
      </h3>
      <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.7 }}>{children}</p>
    </div>
  );
}
