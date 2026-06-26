export default function SuggestionBox({ suggestion }) {
  return (
    <div
      style={{
        background: "#FFF8E1",
        borderLeft: "5px solid #FFC107",
        padding: "12px",
        marginTop: "15px",
        borderRadius: "6px",
      }}
    >
      <strong>Suggested Action:</strong>
      <p style={{ marginTop: "6px" }}>{suggestion}</p>
    </div>
  );
}
