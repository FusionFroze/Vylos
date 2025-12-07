import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Onboarding() {
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState({
    darkMode: false,
    highContrast: false,
    fontSize: 16,
    voiceEnabled: true,
  });

  const update = (key, value) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  const finishOnboarding = async () => {
    try {
      // Save settings
      await API.post("/settings", prefs);

      // Mark onboarding done
      await API.post("/auth/complete-onboarding");

      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Failed to save onboarding, try again.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg p-10 rounded-xl w-[450px]">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Welcome to VoiceWeb 🎤
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Customize your accessibility experience
        </p>

        {/* Theme selector */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Theme
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => update("darkMode", false)}
              className={`flex-1 p-3 rounded ${
                !prefs.darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              Light
            </button>

            <button
              onClick={() => update("darkMode", true)}
              className={`flex-1 p-3 rounded ${
                prefs.darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        {/* High contrast */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-white">
            <input
              type="checkbox"
              checked={prefs.highContrast}
              onChange={(e) => update("highContrast", e.target.checked)}
            />
            <span>Enable High Contrast Mode</span>
          </label>
        </div>

        {/* Font size */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            Font Size
          </h3>

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                update("fontSize", Math.max(12, prefs.fontSize - 2))
              }
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
            >
              -
            </button>

            <span className="text-xl text-gray-900 dark:text-white">
              {prefs.fontSize}px
            </span>

            <button
              onClick={() =>
                update("fontSize", Math.min(30, prefs.fontSize + 2))
              }
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* Voice Control */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer text-gray-900 dark:text-white">
            <input
              type="checkbox"
              checked={prefs.voiceEnabled}
              onChange={(e) => update("voiceEnabled", e.target.checked)}
            />
            <span>Enable Voice Commands</span>
          </label>
        </div>

        <button
          onClick={finishOnboarding}
          className="w-full bg-green-600 text-white py-3 rounded-lg mt-4 hover:bg-green-700"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
}
