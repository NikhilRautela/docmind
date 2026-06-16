import { useState } from "react";
import Upload from "./components/Upload";
import Chat from "./components/Chat";

function App() {
  const [documentId, setDocumentId] = useState(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-400">DocMind</h1>
        <p className="text-center text-gray-400 mb-8">Upload a PDF and chat with it using AI</p>

        {!documentId ? (
          <Upload setDocumentId={setDocumentId} />
        ) : (
          <Chat documentId={documentId} />
        )}
      </div>
    </div>
  );
}

export default App;