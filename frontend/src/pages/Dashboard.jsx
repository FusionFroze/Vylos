import React from "react";

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Welcome to Vylos</h1>
        <p className="text-blue-100 text-lg">
          Your Accessibility-First Voice Browser. Click "Start Listening" and
          you are good to go.
        </p>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Commands */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🗣️</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Voice Commands
            </h2>
          </div>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>• "Scroll Down" / "Scroll Up"</li>
            <li>• "Grid On" / "Click [Number]"</li>
            <li>• "Open Browser"</li>
            <li>• "Go Home"</li>
          </ul>
        </div>

        {/* Card 2: Quick Start */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚀</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Quick Start
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Try saying <strong>"Open Browser"</strong> to start surfing the web
            hands-free.
          </p>
          <button className="w-full py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-medium text-sm">
            Say "Open Notepad" to take notes
          </button>
        </div>

        {/* Card 3: System Status */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">✅</span>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              System Status
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Voice Engine:</span>
              <span className="text-green-500 font-bold">Active</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Database:</span>
              <span className="text-green-500 font-bold">Local (SQLite)</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Environment:</span>
              <span className="text-blue-500 font-bold">Desktop</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
