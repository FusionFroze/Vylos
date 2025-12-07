import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../api";

const PROXY_BASE = "http://localhost:5000/proxy?url=";
const DEFAULT_HOME = "https://en.wikipedia.org/wiki/Main_Page";

// SAME SHORTCUTS HERE for local address bar support
const POPULAR_SITES = {
  cnn: "https://www.cnn.com",
  bbc: "https://www.bbc.com",
  google: "https://www.google.com",
  youtube: "https://www.youtube.com",
  twitter: "https://twitter.com",
  x: "https://twitter.com",
  reddit: "https://www.reddit.com",
  wiki: "https://en.wikipedia.org/wiki/Main_Page",
  wikipedia: "https://en.wikipedia.org/wiki/Main_Page",
  amazon: "https://www.amazon.com",
  facebook: "https://www.facebook.com",
  linkedin: "https://www.linkedin.com",
  netflix: "https://www.netflix.com",
};

// Helper: Normalize spoken text into a valid URL
function normalizeTarget(raw) {
  let u = (raw || "").trim().toLowerCase();
  if (!u) return DEFAULT_HOME;

  // 1. Check Shortcuts
  if (POPULAR_SITES[u]) return POPULAR_SITES[u];

  // 2. Already a URL
  if (u.startsWith("http://") || u.startsWith("https://")) return u;

  // 3. Has a dot → treat as domain
  if (u.includes(".")) {
    u = u.replace(/\s+/g, "");
    return "https://" + u;
  }

  // 4. Otherwise: treat as Wikipedia article (or search)
  const slug = u.replace(/\s+/g, "_");
  return "https://en.wikipedia.org/wiki/" + encodeURIComponent(slug);
}

export default function Browser({ actions, onPageTextUpdate }) {
  const location = useLocation(); // Use location to check for passed state
  const iframeRef = useRef(null);

  const [url, setUrl] = useState(null); // Full proxy URL
  const [inputUrl, setInputUrl] = useState(DEFAULT_HOME); // Visible text
  const [isLoading, setIsLoading] = useState(false);

  // History stack management
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  // -----------------------------
  // Navigation Logic
  // -----------------------------
  const pushToHistory = (originalUrl) => {
    setIsLoading(true);
    const target = normalizeTarget(originalUrl);
    const proxied = PROXY_BASE + encodeURIComponent(target);

    // Update state
    setUrl(proxied);
    setInputUrl(target);

    // Clear old text while loading
    if (onPageTextUpdate) onPageTextUpdate("");

    // Update history stack
    const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
    const next = [...trimmed, { proxied, original: target }];
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
  };

  const goBack = () => {
    const idx = historyIndexRef.current;
    if (idx <= 0) return actions.speak("Can't go back");

    const newIndex = idx - 1;
    historyIndexRef.current = newIndex;
    const entry = historyRef.current[newIndex];
    if (!entry) return;

    setUrl(entry.proxied);
    setInputUrl(entry.original);
  };

  const goForward = () => {
    const idx = historyIndexRef.current;
    if (idx >= historyRef.current.length - 1)
      return actions.speak("Can't go forward");

    const newIndex = idx + 1;
    historyIndexRef.current = newIndex;
    const entry = historyRef.current[newIndex];
    if (!entry) return;

    setUrl(entry.proxied);
    setInputUrl(entry.original);
  };

  const loadUrl = (raw) => {
    pushToHistory(raw || inputUrl);
  };

  // Initial Load: Check if App.js sent us a URL via state, otherwise default
  useEffect(() => {
    if (location.state && location.state.url) {
      pushToHistory(location.state.url);
    } else {
      pushToHistory(DEFAULT_HOME);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]); // Re-run if location state changes (e.g. voice command sends new URL)

  // -----------------------------
  // Iframe Communication
  // -----------------------------
  useEffect(() => {
    function handleMessage(event) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "page_text") {
        setIsLoading(false);
        if (onPageTextUpdate) onPageTextUpdate(data.text || "");
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onPageTextUpdate]);

  // -----------------------------
  // Action Overrides (Voice Control)
  // -----------------------------
  useEffect(() => {
    if (!actions) return;

    const originalOpenUrl = actions.openUrl;
    const originalGridClick = actions.gridClick;

    // Override Open URL for browser usage
    actions.openUrl = (site) => {
      const internalRoutes = [
        "/settings",
        "/dashboard",
        "/macros",
        "/summarize",
      ];
      if (internalRoutes.includes(site) || site.startsWith("/")) {
        window.location.href = site;
      } else {
        pushToHistory(site);
      }
    };

    actions.browserBack = () => goBack();
    actions.browserForward = () => goForward();
    actions.back = () => goBack();
    actions.forward = () => goForward();

    const postToFrame = (action) => {
      const win = iframeRef.current?.contentWindow;
      if (win) win.postMessage({ action }, "*");
    };

    actions.scrollDown = () => postToFrame("scroll_down");
    actions.scrollUp = () => postToFrame("scroll_up");
    actions.scrollTop = () => postToFrame("scroll_top");

    actions.gridClick = (num) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const rect = iframe.getBoundingClientRect();
      const rows = 6;
      const cols = 6;
      const index = num - 1;

      if (index < 0 || index >= rows * cols) {
        actions.speak("Grid number out of range");
        return;
      }

      const row = Math.floor(index / cols);
      const col = index % cols;

      // Coordinates relative to the IFRAME
      const x = ((col + 0.5) * rect.width) / cols;
      const y = ((row + 0.5) * rect.height) / rows;

      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        actions.speak(`${num} it is`);
        iframeWindow.postMessage({ action: "click_xy", x, y }, "*");
      }
    };

    actions.readPage = () => {
      actions.speak("Reading page...");
    };

    return () => {
      actions.openUrl = originalOpenUrl;
      actions.gridClick = originalGridClick;
    };
  }, [actions]);

  // -----------------------------
  // UI Render
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    loadUrl(inputUrl);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Address Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-b border-gray-300 flex gap-2 items-center shadow-sm"
      >
        <button
          type="button"
          onClick={goBack}
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goForward}
          className="p-2 hover:bg-gray-100 rounded text-gray-600"
        >
          →
        </button>

        <input
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder='Enter URL or say "Open CNN"'
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Go
        </button>
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="w-full h-1 bg-gray-200 overflow-hidden">
          <div className="animate-progress h-full bg-blue-500 origin-left-right"></div>
        </div>
      )}

      {/* Browser Frame */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={url || undefined}
          className="w-full h-full"
          style={{ border: "none" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          title="VoiceWeb Browser"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
