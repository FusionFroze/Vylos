import React, { useState } from "react";
import API from "../api";

export default function Summarize() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const runSummary = async () => {
    setLoading(true);
    const text = document.body.innerText;

    const res = await API.post("/ai/summarize", {
      pageText: text,
    });

    setSummary(res.data.summary);
    setLoading(false);
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Page Summarizer</h1>

      <button
        onClick={runSummary}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Summarize This Page
      </button>

      {loading && <p className="mt-4">Generating summary...</p>}

      {summary && (
        <p className="mt-6 p-4 border rounded bg-gray-100 text-lg">{summary}</p>
      )}
    </div>
  );
}
