import React from "react";

export default function VoiceIndicator({ listening }) {
  return (
    <div
      className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg text-white font-bold
      transition-all duration-300
      bg-blue-600 z-50"
    >
      {listening ? "🎤 Listening..." : "🎙 Click to Start"}
    </div>
  );
}
