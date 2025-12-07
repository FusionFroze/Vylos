import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Macros from "./pages/Macros";
import Summarize from "./pages/Summarize";
import Onboarding from "./pages/Onboarding";
import Browser from "./pages/Browser";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import GridOverlay from "./components/GridOverlay";
import VoiceIndicator from "./components/VoiceIndicator";
import Notepad from "./components/Notepad";

// Hooks & Voice
import useSpeechRecognition from "./hooks/useSpeechRecognition";
import useTextToSpeech from "./hooks/useTextToSpeech";
import { interpret } from "./voice/useVoiceInterpreter";
import { processCommand } from "./voice/commandProcessor";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showGrid, setShowGrid] = useState(false);
  const [showNotepad, setShowNotepad] = useState(false);
  const [notepadMode, setNotepadMode] = useState("list"); // 'list' or 'create'

  const { speak, stop } = useTextToSpeech();
  const [macros, setMacros] = useState([]);

  const [theme, setTheme] = useState({
    darkMode: false,
    highContrast: false,
    fontSize: 16,
  });

  const [pageText, setPageText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/settings")
      .then((res) => res.data && setTheme(res.data))
      .catch(() => {});
    API.get("/macros")
      .then((res) => setMacros(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.fontSize = theme.fontSize + "px";
    if (theme.darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    if (theme.highContrast) document.body.classList.add("high-contrast");
    else document.body.classList.remove("high-contrast");
  }, [theme]);

  // =======================================================
  // Actions
  // =======================================================
  const actions = useMemo(
    () => ({
      // --- Notepad ---
      openNotepad: (mode = "list") => {
        setShowNotepad(true);
        setNotepadMode(mode);
        speak(
          mode === "create"
            ? "Opening new note. Start typing."
            : "Opening notepad"
        );
      },
      closeNotepad: () => {
        setShowNotepad(false);
        speak("Closing notepad");
      },

      // --- Navigation ---
      openUrl: (url) => {
        let target = url.toLowerCase().trim();
        if (POPULAR_SITES[target]) {
          navigate("/browser", { state: { url: POPULAR_SITES[target] } });
          return;
        }
        if (
          target.startsWith("/") ||
          (!target.startsWith("http") && !target.includes("."))
        ) {
          const knownRoutes = [
            "dashboard",
            "settings",
            "macros",
            "summarize",
            "browser",
            "onboarding",
          ];
          if (knownRoutes.includes(target) || target.startsWith("/")) {
            navigate(target);
          } else {
            navigate("/browser", { state: { url: `https://${target}.com` } });
          }
        } else {
          if (!target.startsWith("http")) target = "https://" + target;
          navigate("/browser", { state: { url: target } });
        }
      },

      navigateTo: (page) => {
        const routes = {
          dashboard: "/",
          settings: "/settings",
          macros: "/macros",
          summarize: "/summarize",
          browser: "/browser",
          home: "/",
        };
        const target = routes[page.toLowerCase()];
        if (!target) return speak("Page not found");
        navigate(target);
      },

      scrollDown: () => window.scrollBy({ top: 300, behavior: "smooth" }),
      scrollUp: () => window.scrollBy({ top: -300, behavior: "smooth" }),
      scrollTop: () => window.scrollTo({ top: 0, behavior: "smooth" }),

      toggleGrid: (v) => setShowGrid(v),

      gridClick: (num) => {
        const cols = 6;
        const rows = 6;
        const gridX = (num - 1) % cols;
        const gridY = Math.floor((num - 1) / cols);
        const cellWidth = window.innerWidth / cols;
        const cellHeight = window.innerHeight / rows;
        const x = gridX * cellWidth + cellWidth / 2;
        const y = gridY * cellHeight + cellHeight / 2;

        const elements = document.elementsFromPoint(x, y);
        const clickable = elements.find((el) => {
          if (el.id === "grid-overlay" || el.closest("#grid-overlay"))
            return false;
          const tag = el.tagName;
          if (
            [
              "A",
              "BUTTON",
              "INPUT",
              "TEXTAREA",
              "SELECT",
              "LABEL",
              "SUMMARY",
            ].includes(tag)
          )
            return true;
          const role = el.getAttribute("role");
          if (role === "button" || role === "link" || role === "menuitem")
            return true;
          const style = window.getComputedStyle(el);
          if (style.cursor === "pointer") return true;
          return el.onclick || el.dataset.clickable === "true";
        });

        if (clickable) {
          const originalOutline = clickable.style.outline;
          clickable.style.outline = "3px solid #ef4444";
          setTimeout(() => (clickable.style.outline = originalOutline), 1000);
          clickable.focus();
          clickable.click();
          speak(`${num} it is`);
        } else {
          speak("Nothing clickable there");
        }
      },

      speak: (text) => speak(text),
      stopSpeaking: () => stop(),
      stopReading: () => {
        stop();
        speak("Stopped reading");
      },

      readPage: () => {
        if (!pageText) return speak("Page text not ready yet");
        speak(pageText);
      },

      summarizePage: async () => {
        if (!pageText) return speak("Cannot summarize this page");
        speak("Summarizing this page");
        try {
          const res = await API.post("/ai/summarize", { pageText });
          speak(res.data.summary);
        } catch {
          speak("Failed to summarize");
        }
      },

      readSelection: () => {
        const text = window.getSelection().toString();
        text ? speak(text) : speak("No text selected");
      },

      readParagraph: (n) => {
        const p = [...document.querySelectorAll("p")];
        if (!p[n - 1]) return speak("Paragraph not found");
        speak(p[n - 1].innerText);
      },

      runMacro: (name) => {
        const macro = macros.find(
          (m) =>
            m.name.toLowerCase() === name.toLowerCase() ||
            m.trigger.toLowerCase() === name.toLowerCase()
        );
        if (!macro) return speak("Macro not found");
        speak(`Running macro ${macro.name}`);
        macro.actions.forEach((action) => {
          if (action.type === "open_url") actions.openUrl(action.payload);
          if (action.type === "speak") speak(action.payload);
        });
      },

      createMacro: async (name, url) => {
        speak(`Creating macro ${name}`);
        try {
          await API.post("/macros", {
            name,
            trigger: name,
            actions: [{ type: "open_url", payload: url }],
          });
          const res = await API.get("/macros");
          setMacros(res.data);
          speak("Macro created");
        } catch (e) {
          speak("Error creating macro");
        }
      },

      setTheme: (newTheme) => {
        const updated = { ...theme, ...newTheme };
        setTheme(updated);
        API.post("/settings", updated).catch(() => {});
      },

      changeFontSize: (direction) => {
        const newSize =
          direction === "increase" ? theme.fontSize + 2 : theme.fontSize - 2;
        const updated = { ...theme, fontSize: newSize };
        setTheme(updated);
        API.post("/settings", updated).catch(() => {});
      },

      enableTyping: () => {
        window.voiceTypingEnabled = true;
        speak("Voice typing enabled");
      },

      disableTyping: () => {
        window.voiceTypingEnabled = false;
        speak("Voice typing disabled");
      },

      typeIntoActive: (text) => {
        const el = document.activeElement;
        if (
          el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.contentEditable === "true")
        ) {
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          const value = el.value || "";
          if (typeof el.value !== "undefined") {
            el.value =
              value.substring(0, start) + " " + text + value.substring(end);
            el.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            el.innerText += " " + text;
          }
        } else speak("No active input field");
      },
    }),
    [theme, macros, pageText, speak, stop, navigate]
  );

  const handleVoiceCommand = useCallback(
    async (cmd) => {
      try {
        const ai = await interpret(cmd);
        let handled = false;

        if (ai && ai.action) {
          handled = true;
          switch (ai.action) {
            case "scroll_down":
              actions.scrollDown();
              break;
            case "scroll_up":
              actions.scrollUp();
              break;
            case "scroll_top":
              actions.scrollTop();
              break;
            case "toggle_grid_on":
              actions.toggleGrid(true);
              break;
            case "toggle_grid_off":
              actions.toggleGrid(false);
              break;
            case "click_grid":
              actions.gridClick(ai.grid_number);
              break;
            case "open_url":
              actions.openUrl(ai.url);
              break;
            case "wikipedia_search":
              actions.openUrl(
                `https://en.wikipedia.org/wiki/${encodeURIComponent(ai.query)}`
              );
              break;
            case "cnn_search":
              actions.openUrl(
                `https://www.cnn.com/${encodeURIComponent(ai.query)}`
              );
              break;
            case "read_page":
              actions.readPage();
              break;
            case "summarize_page":
              actions.summarizePage();
              break;
            case "navigate":
              actions.navigateTo(ai.page);
              break;
            case "macro_run":
              actions.runMacro(ai.macroName);
              break;
            case "type_text":
              actions.typeIntoActive(ai.text);
              break;
            case "open_notepad":
              actions.openNotepad("list");
              break;
            default:
              handled = false;
          }
        }

        if (!handled) processCommand(cmd, actions);
      } catch (err) {
        console.error("Voice handling error:", err);
        processCommand(cmd, actions);
      }
    },
    [actions]
  );

  const { listening, setListening } = useSpeechRecognition(handleVoiceCommand);

  return (
    <>
      <GridOverlay show={showGrid} />
      <VoiceIndicator listening={listening} />

      {/* Pass the mode (list/create) to Notepad */}
      <Notepad
        isOpen={showNotepad}
        onClose={() => setShowNotepad(false)}
        speak={speak}
        initialMode={notepadMode}
      />

      <button
        onClick={() => setListening((p) => !p)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full z-50 shadow-lg hover:bg-blue-700 transition font-medium"
      >
        {listening ? "Stop Listening" : "Start Listening"}
      </button>

      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/macros" element={<Macros />} />
          <Route path="/summarize" element={<Summarize />} />
        </Route>
        <Route
          path="/browser"
          element={
            <ProtectedRoute>
              <Browser actions={actions} onPageTextUpdate={setPageText} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
