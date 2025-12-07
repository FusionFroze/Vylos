import React, { useEffect, useState } from "react";
import API from "../api";

export default function Macros() {
  const [macros, setMacros] = useState([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [actionType, setActionType] = useState("open_url");
  const [payload, setPayload] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchMacros = async () => {
    try {
      const res = await API.get("/macros");
      setMacros(res.data);
    } catch (err) {
      console.log("Error fetching macros:", err);
    }
  };

  const createMacro = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/macros", {
        name,
        trigger,
        actions: [
          {
            type: actionType,
            payload: payload,
          },
        ],
      });

      // reset
      setName("");
      setTrigger("");
      setPayload("");

      await fetchMacros();
    } catch (err) {
      console.log("Error creating macro:", err);
    }

    setLoading(false);
  };

  const deleteMacro = async (id) => {
    try {
      await API.delete(`/macros/${id}`);
      await fetchMacros();
    } catch (err) {
      console.log("Delete error", err);
    }
  };

  useEffect(() => {
    fetchMacros();
  }, []);

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Voice Macros</h1>

      {/* CREATE MACRO */}
      <form
        onSubmit={createMacro}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-10"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Macro</h2>

        {/* Macro Name */}
        <input
          type="text"
          placeholder="Macro Name"
          className="w-full mb-3 p-2 border rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Voice Trigger */}
        <input
          type="text"
          placeholder="Voice Trigger"
          className="w-full mb-3 p-2 border rounded text-black"
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          required
        />

        {/* Action Type */}
        <select
          className="w-full mb-3 p-2 border rounded text-black"
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
        >
          <option value="open_url">Open URL</option>
          <option value="speak">Speak Text</option>
        </select>

        {/* Action Payload */}
        <input
          type="text"
          placeholder={actionType === "open_url" ? "URL" : "Text to speak"}
          className="w-full mb-3 p-2 border rounded text-black"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Creating..." : "Create Macro"}
        </button>
      </form>

      {/* LIST MACROS */}
      <h2 className="text-xl font-semibold mb-4">Your Macros</h2>

      {macros.length === 0 && (
        <p className="text-gray-500">No macros created yet.</p>
      )}

      <ul className="space-y-3">
        {macros.map((m) => (
          <li
            key={m.id}
            className="flex justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-md"
          >
            <div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Trigger: <b>{m.trigger}</b>
              </p>
            </div>

            <button
              onClick={() => deleteMacro(m.id)}
              className="text-red-600 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
