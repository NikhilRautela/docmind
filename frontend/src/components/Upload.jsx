import { useState } from "react";

function Upload({ setDocumentId }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("https://docmind-backend-spww.onrender.com", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.documentId) {
        setDocumentId(data.documentId);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Server error. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <h2 className="text-xl font-semibold mb-6 text-center">Upload your PDF</h2>

      <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center mb-6">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          id="fileInput"
        />
        <label htmlFor="fileInput" className="cursor-pointer">
          <div className="text-5xl mb-3">📄</div>
          <p className="text-gray-400">
            {file ? file.name : "Click to select a PDF file"}
          </p>
        </label>
      </div>

      {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
      >
        {loading ? "Uploading & Processing..." : "Upload PDF"}
      </button>
    </div>
  );
}

export default Upload;