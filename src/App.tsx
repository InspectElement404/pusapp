import React, { useState } from "react";
import axios from "axios";

interface PredictionResponse {
  breeds: string[];
}

const App: React.FC = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      const res = await axios.post<PredictionResponse>(
        "http://127.0.0.1:8000/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setPredictions(res.data.breeds);
    } catch (err) {
      console.error(err);
      alert("Error uploading images.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cat Breed Detector 🐱</h1>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Predicting..." : "Upload & Predict"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        <h2>Predictions:</h2>
        <ul>
          {predictions.map((breed, idx) => (
            <li key={idx}>
              {breed.label} — {(breed.score * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
