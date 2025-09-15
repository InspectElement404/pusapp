import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Lucide React is assumed to be available. We'll use a loader icon.
// Let's define the types for our data, mirroring the backend.
interface BreedPrediction {
  label: string;
  score: number;
}

// Prediction response will be an array of arrays of predictions.
interface PredictionResponse {
  breeds: BreedPrediction[][];
}

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [predictions, setPredictions] = useState<BreedPrediction[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle image upload and prediction request
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setLoading(true);
      setError(null);
      const res = await axios.post<PredictionResponse>(
        "https://api.bungangera.site/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setPredictions(res.data.breeds);
    } catch (err) {
      console.error(err);
      setError(
        "Error uploading images or getting predictions. Please check the backend server and try again."
      );
    } finally {
      setLoading(false);
      // Reset file input to allow selecting the same files again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFiles([]);
    }
  };

  // Utility function to get the base64 URL of an image for preview
  const getImageUrl = (file: File): string => URL.createObjectURL(file);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-inter">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          Cat Breed Detector 🐱
        </h1>
        <p className="text-center text-gray-600">
          Upload one or more images of cats to predict their breed.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setFiles(Array.from(e.target.files));
                setPredictions([]);
                setError(null);
              }
            }}
            className="w-full md:w-auto text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-violet-50 file:text-violet-700
                       hover:file:bg-violet-100"
          />
          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="w-full md:w-auto flex items-center justify-center
                       px-6 py-2.5 rounded-full text-white font-semibold
                       bg-violet-600 hover:bg-violet-700 focus:outline-none
                       focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
                       disabled:bg-violet-300 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              "Upload & Predict"
            )}
          </button>
        </div>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative text-center"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Selected Images:
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center p-2 rounded-xl border border-gray-300 bg-gray-50"
                >
                  <img
                    src={getImageUrl(file)}
                    alt={`Preview ${index}`}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <span className="text-xs text-gray-500 mt-1 truncate max-w-[96px]">
                    {file.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {predictions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Predictions:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((imagePredictions, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm"
                >
                  <h3 className="font-medium text-gray-700 mb-2">
                    Image {index + 1} Predictions:
                  </h3>
                  <ul className="list-none space-y-1">
                    {imagePredictions.map((breed, idx) => (
                      <li key={idx} className="text-gray-600 text-sm">
                        <span className="font-mono">{idx + 1}.</span>{" "}
                        <span className="font-medium">{breed.label}</span>
                        <span className="text-gray-500">
                          {" "}
                          — {(breed.score * 100).toFixed(2)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
