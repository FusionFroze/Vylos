import { useState, useEffect, useRef } from "react";

export default function useSpeechRecognition(onCommand) {
  const [listening, setListening] = useState(false);

  // Ref to track listening state
  const isListeningRef = useRef(listening);
  const recognitionRef = useRef(null);

  // Ref to store the timer ID
  const commandTimerRef = useRef(null);

  // Loop Prevention: Track the last command and time
  const lastCommandRef = useRef({ text: "", time: 0 });

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // We need interim to reset the timer while you speak
      recognition.lang = "en-US";
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;

    recognition.onresult = (event) => {
      // Clear the existing timer immediately whenever voice is detected
      if (commandTimerRef.current) {
        clearTimeout(commandTimerRef.current);
      }

      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      const text = transcript.trim();
      const lower = text.toLowerCase();

      // Set a new timer. We only execute if there is silence for 800ms
      commandTimerRef.current = setTimeout(() => {
        executeCommand(text, lower);
      }, 800);
    };

    // Separate function to handle the actual logic after the delay
    const executeCommand = (text, lower) => {
      const now = Date.now();

      // --- LOOP PREVENTION ---
      if (
        lastCommandRef.current.text === lower &&
        now - lastCommandRef.current.time < 2000
      ) {
        return;
      }

      lastCommandRef.current = { text: lower, time: now };

      // 1. ESCAPE HATCH (Stop Typing)
      if (
        window.voiceTypingEnabled &&
        (lower === "stop typing" || lower === "disable typing")
      ) {
        window.voiceTypingEnabled = false;
        onCommand("stop typing"); // Send to App.js for feedback
        return;
      }

      // 2. TYPING MODE (Direct Input)
      if (window.voiceTypingEnabled) {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            active.contentEditable === "true")
        ) {
          if (typeof active.value !== "undefined") {
            const start = active.selectionStart || 0;
            const end = active.selectionEnd || 0;
            const val = active.value;
            const prefix = val.length > 0 && !val.endsWith(" ") ? " " : "";

            active.value =
              val.substring(0, start) + prefix + text + val.substring(end);

            active.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            active.innerText += " " + text;
          }
          return;
        }
      }

      // 3. NORMAL COMMAND MODE
      // Only send if it's not empty
      if (text.length > 0) {
        onCommand(text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setListening(false);
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          /* ignore */
        }
      }
    };

    if (listening) {
      try {
        recognition.start();
      } catch (e) {
        /* ignore */
      }
    } else {
      recognition.stop();
    }

    return () => {
      if (commandTimerRef.current) clearTimeout(commandTimerRef.current);
    };
  }, [listening, onCommand]);

  return {
    listening,
    setListening,
  };
}
