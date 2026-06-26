import { useState } from "react";
import axios from "axios";

import AudioRecorder from "./components/AudioRecorder";
import RiskBadge from "./components/RiskBadge";
import SuggestionBox from "./components/SuggestionBox";

const API_BASE = "http://localhost:3001";

function App() {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState("demo@noise.ai");
  const [password, setPassword] = useState("password123");

  const [features, setFeatures] = useState(null);
  const [result, setResult] = useState(null);
  const [context, setContext] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const parseExplanation = (text) => {
    const answer = { summary: "", cause: "", danger: "", action: "" };
    if (!text) return answer;

    const headings = [
      { key: "summary", label: /what it likely is[:\-]?/i },
      { key: "cause", label: /why it happens[:\-]?/i },
      { key: "danger", label: /is it dangerous\??[:\-]?/i },
      { key: "action", label: /next step[:\-]?/i },
    ];

    headings.forEach((heading, index) => {
      const match = text.match(heading.label);
      if (!match) return;

      const start = match.index + match[0].length;
      const remainder = text.slice(start);
      const nextHeadingIndex = headings
        .slice(index + 1)
        .map((h) => {
          const nextMatch = remainder.match(h.label);
          return nextMatch ? nextMatch.index : -1;
        })
        .filter((i) => i >= 0);

      const end = nextHeadingIndex.length ? Math.min(...nextHeadingIndex) : remainder.length;
      answer[heading.key] = remainder.slice(0, end).trim().replace(/^[:\-]?\s*/, "");
    });

    if (!answer.summary) answer.summary = text;
    return answer;
  };

  // ---------------- LOGIN ----------------
  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      setToken(res.data.token);
    } catch (err) {
      alert("Login failed");
    }
  };

  // ---------------- FILE UPLOAD ----------------
  const uploadAudioFile = async (file) => {
    if (!file) return;

    setUploadError(null);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const res = await axios.post(`${API_BASE}/analyze-sound`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.loaded === progressEvent.total) {
            setUploadStatus("Analyzing...");
          }
        },
      });

      setFeatures(res.data.features);
      setUploadStatus("Upload and analysis complete");
    } catch (err) {
      console.error("Frontend uploadAudioFile failed:", err.response?.status, err.response?.data || err.message);
      setUploadStatus("Upload failed");
      setUploadError("Unable to upload and analyze audio. Check console for details.");
      alert("Upload failed. Check browser console for details.");
    }
  };

  // ---------------- EXPLAIN NOISE ----------------
  const explainNoise = async () => {
    const res = await axios.post(
      `${API_BASE}/explain-noise`,
      { features, context },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setResult(res.data);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
      <h1>Home Noise Interpreter</h1>

      {/* ---------------- LOGIN SECTION ---------------- */}
      {!token && (
        <section>
          <h2>Login</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <br />
          <button onClick={login}>Login</button>
        </section>
      )}

      {/* ---------------- MAIN APP ---------------- */}
      {token && (
        <>
          <section>
            <h2>1. Record or Upload Noise</h2>

            <AudioRecorder onFeaturesExtracted={setFeatures} token={token} />

            <p style={{ margin: "10px 0" }}>OR upload a file:</p>

            <input
              type="file"
              accept="audio/*"
              onChange={(e) => uploadAudioFile(e.target.files[0])}
            />
            {uploadStatus && (
              <p style={{ marginTop: "10px", fontStyle: "italic" }}>{uploadStatus}</p>
            )}
            {uploadError && (
              <p style={{ marginTop: "10px", color: "red" }}>{uploadError}</p>
            )}
          </section>

          {features && (
            <section>
              <h2>2. Add Context (optional)</h2>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
                placeholder="Example: This sound comes from the kitchen at night."
              />
              <button onClick={explainNoise}>Explain Noise</button>
            </section>
          )}

          {result && (
            <section style={{ marginTop: "2rem" }}>
              <h2>3. Explanation</h2>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e0e0e0",
                  borderRadius: "18px",
                  padding: "18px",
                  maxHeight: "320px",
                  overflowY: "auto",
                  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
                  lineHeight: 1.6,
                  color: "#374151",
                  marginTop: "16px",
                }}
              >
                <div style={{ marginBottom: "14px" }}>
                  <strong style={{ fontSize: "1.05rem", color: "#111827" }}>
                    What it likely is
                  </strong>
                  <p style={{ margin: "8px 0 0" }}>{parseExplanation(result.explanation).summary}</p>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <strong style={{ fontSize: "1.05rem", color: "#111827" }}>
                    Why it happens
                  </strong>
                  <p style={{ margin: "8px 0 0" }}>{parseExplanation(result.explanation).cause}</p>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <strong style={{ fontSize: "1.05rem", color: "#111827" }}>
                    Is it dangerous?
                  </strong>
                  <p style={{ margin: "8px 0 0" }}>{parseExplanation(result.explanation).danger}</p>
                </div>

                <div style={{ marginBottom: "0" }}>
                  <strong style={{ fontSize: "1.05rem", color: "#111827" }}>
                    Next step
                  </strong>
                  <p style={{ margin: "8px 0 0" }}>{parseExplanation(result.explanation).action || result.suggestion}</p>
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <RiskBadge level={result.risk} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default App;
