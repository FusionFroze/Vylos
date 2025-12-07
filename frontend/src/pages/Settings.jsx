import React, { useState, useEffect } from "react";
import API from "../api";

export default function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    API.get("/settings").then((res) => setSettings(res.data || {}));
  }, []);

  const update = () => {
    API.post("/settings", settings);
    alert("Settings saved");
  };

  if (!settings) return <div className="p-10">Loading settings...</div>;

  return (
    <div className="p-10 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Accessibility Settings</h1>

      <label className="block mb-4">
        Font Size:
        <input
          type="number"
          className="border p-2 ml-3"
          value={settings.fontSize}
          onChange={(e) =>
            setSettings({ ...settings, fontSize: Number(e.target.value) })
          }
        />
      </label>

      <label className="block mb-4">
        High Contrast:
        <input
          type="checkbox"
          className="ml-3"
          checked={settings.highContrast}
          onChange={(e) =>
            setSettings({ ...settings, highContrast: e.target.checked })
          }
        />
      </label>

      <label className="block mb-4">
        Dark Mode:
        <input
          type="checkbox"
          className="ml-3"
          checked={settings.darkMode}
          onChange={(e) =>
            setSettings({ ...settings, darkMode: e.target.checked })
          }
        />
      </label>

      <button onClick={update} className="bg-blue-600 text-white p-2 rounded">
        Save Settings
      </button>
    </div>
  );
}
