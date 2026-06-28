import { useState, useRef } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3001";

export default function AudioRecorder({ onFeaturesExtracted, token }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [blob, setBlob] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
      setBlob(audioBlob);
      setAudioURL(URL.createObjectURL(audioBlob));
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const uploadRecording = async () => {
    if (!blob) return;

    setError(null);
    setStatus("Uploading...");
    console.log("Uploading audio...");

    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");

    try {
      const res = await axios.post(`${API_BASE}/analyze-sound`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && progressEvent.loaded === progressEvent.total) {
            console.log("Upload complete, analyzing audio...");
            setStatus("Analyzing...");
          }
        },
      });

      console.log("Audio analysis complete");
      setStatus("Upload and analysis complete");
      onFeaturesExtracted(res.data.features);
    } catch (err) {
      console.error("Frontend uploadRecording failed:", err.response?.status, err.response?.data || err.message);
      setStatus("Upload failed");
      setError("Unable to upload and analyze audio. Check browser console for details.");
      alert("Upload failed. See browser console for details.");
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Record a Noise</h3>

      {!isRecording && (
        <button onClick={startRecording} style={{ padding: "10px" }}>
          🎙️ Start Recording
        </button>
      )}

      {isRecording && (
        <button onClick={stopRecording} style={{ padding: "10px", background: "red", color: "white" }}>
          ⏹️ Stop Recording
        </button>
      )}

      {audioURL && (
        <div style={{ marginTop: "1rem" }}>
          <audio controls src={audioURL}></audio>
          <br />
          <button onClick={uploadRecording} style={{ marginTop: "10px", padding: "10px" }}>
            ⬆️ Upload & Analyze
          </button>
          {status && <p style={{ marginTop: "10px", fontStyle: "italic" }}>{status}</p>}
          {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}
        </div>
      )}
    </div>
  );
}
