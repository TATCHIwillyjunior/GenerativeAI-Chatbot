export default function RiskBadge({ level }) {
  const colors = {
    low: "#4CAF50",
    medium: "#FFC107",
    high: "#F44336",
  };

  const labels = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
  };

  return (
    <span
      style={{
        background: colors[level],
        color: "white",
        padding: "6px 12px",
        borderRadius: "8px",
        fontWeight: "bold",
        fontSize: "0.9rem",
      }}
    >
      {labels[level]}
    </span>
  );
}
