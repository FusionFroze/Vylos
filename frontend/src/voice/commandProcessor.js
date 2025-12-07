import { processBrowserCommands } from "./browserCommands";

const sanitizeUrl = (url) => {
  let clean = url.toLowerCase().replace(/\s+/g, "");
  if (!clean.includes("http")) {
    clean = "https://" + clean;
  }
  return clean;
};

export const processCommand = (cmd, actions) => {
  if (!cmd) return;

  const lower = cmd
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .trim();

  // ======================================================
  // 1) Voice Typing
  // ======================================================
  if (lower === "start typing" || lower === "enable typing") {
    return actions.enableTyping();
  }
  if (lower === "stop typing" || lower === "disable typing") {
    return actions.disableTyping();
  }
  if (window.voiceTypingEnabled && lower.startsWith("type ")) {
    return actions.typeIntoActive(lower.replace("type ", ""));
  }

  // ======================================================
  // 2) Stop / Silence
  // ======================================================
  if (
    lower.includes("stop reading") ||
    lower.includes("stop speaking") ||
    lower === "shut up"
  ) {
    return actions.stopReading();
  }

  // ======================================================
  // 3) Notepad
  // ======================================================
  if (
    lower.includes("take a note") ||
    lower.includes("new note") ||
    lower.includes("create note")
  ) {
    return actions.openNotepad("create");
  }
  if (lower.includes("open notepad")) {
    return actions.openNotepad("list");
  }
  if (lower.includes("close notepad")) {
    return actions.closeNotepad();
  }

  // ======================================================
  // 4) Scrolling
  // ======================================================
  if (lower === "scroll down" || lower === "down") return actions.scrollDown();
  if (lower === "scroll up" || lower === "up") return actions.scrollUp();
  if (lower === "scroll top" || lower === "go to top")
    return actions.scrollTop();

  // ======================================================
  // 5) Navigation
  // ======================================================
  if (lower.includes("open dashboard")) return actions.navigateTo("dashboard");
  if (lower.includes("open settings")) return actions.navigateTo("settings");
  if (lower.includes("open macros")) return actions.navigateTo("macros");
  if (lower.includes("open summarize")) return actions.navigateTo("summarize");
  if (lower.includes("open browser")) return actions.navigateTo("browser");
  if (lower.includes("go home")) return actions.navigateTo("home");

  // ======================================================
  // 6) Grid Controls (Relaxed Fallback)
  // ======================================================
  // Handle "greed" which is a common misinterpretation of "grid"
  if (lower.includes("grid") || lower.includes("greed")) {
    if (
      lower.includes("off") ||
      lower.includes("hide") ||
      lower.includes("remove")
    ) {
      return actions.toggleGrid(false);
    }
    const clickMatch = lower.match(/(\d+)/);
    if (clickMatch) {
      return actions.gridClick(Number(clickMatch[1]));
    }
    // Default fallback to turning ON if unsure, since 'toggle' state isn't available here easily
    return actions.toggleGrid(true);
  }

  const clickMatch = lower.match(/click (\d+)/);
  if (clickMatch) return actions.gridClick(Number(clickMatch[1]));

  // ======================================================
  // 7) Search
  // ======================================================
  if (lower.startsWith("search ")) {
    const topic = lower.replace("search ", "").trim();
    if (!topic) return actions.speak("What should I search?");
    const slug = topic.replace(/\s+/g, "_");
    return actions.openUrl(
      `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`
    );
  }

  // ======================================================
  // 8) Reader Mode
  // ======================================================
  if (lower.includes("read this page") || lower === "read page")
    return actions.readPage();
  if (lower.includes("summarize")) return actions.summarizePage();
  if (lower.includes("read selection")) return actions.readSelection();

  const para = lower.match(/read paragraph (\d+)/);
  if (para) return actions.readParagraph(Number(para[1]));

  // ======================================================
  // 9) Theme
  // ======================================================
  if (lower.includes("dark mode on"))
    return actions.setTheme({ darkMode: true });
  if (lower.includes("dark mode off"))
    return actions.setTheme({ darkMode: false });
  if (lower.includes("high contrast on"))
    return actions.setTheme({ highContrast: true });
  if (lower.includes("high contrast off"))
    return actions.setTheme({ highContrast: false });
  if (lower.includes("increase font"))
    return actions.changeFontSize("increase");
  if (lower.includes("decrease font"))
    return actions.changeFontSize("decrease");

  // ======================================================
  // 10) Macros
  // ======================================================
  const macroMatch = lower.match(/create macro called (.+?) (open|go to) (.+)/);
  if (macroMatch) {
    const name = macroMatch[1].trim();
    let url = macroMatch[3].trim();
    url = url.replace(" dot ", ".").replace(" point ", ".");
    url = sanitizeUrl(url);
    return actions.createMacro(name, url);
  }

  if (lower.startsWith("run macro")) {
    const macroName = lower.replace("run macro", "").trim();
    return actions.runMacro(macroName);
  }

  // ======================================================
  // 11) Fallback
  // ======================================================
  if (processBrowserCommands) {
    const browserHandled = processBrowserCommands(lower, actions);
    if (browserHandled) return;
  }

  return null;
};
