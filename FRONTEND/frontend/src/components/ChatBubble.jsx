export default function ChatBubble({ text, type }) {
  const isAI = type === "ai";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        margin: "10px 0",
      }}
    >
      <div
        style={{
          maxWidth: "70%",
          padding: "12px",
          borderRadius: "12px",
          background: isAI ? "#E3F2FD" : "#C8E6C9",
          color: "#333",
          fontSize: "1rem",
          lineHeight: "1.4",
        }}
      >
        {text}
      </div>
    </div>
  );
}
