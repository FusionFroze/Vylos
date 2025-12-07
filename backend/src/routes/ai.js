import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import auth from "../middleware/auth.js";

const router = express.Router();

// Initialize Gemini (kept for future use, but bypassed for commands to prevent errors)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/* ===============================================================
   VOICE COMMAND INTERPRETER (Local Logic)
================================================================ */
router.post("/interpret", async (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 2) return res.json({ action: "none" });

  // CLEANUP: Remove punctuation and trim whitespace
  const lower = text
    .toLowerCase()
    .replace(/[.,!?;:]/g, "")
    .trim();

  console.log("Interpreting command:", lower);

  // ============================================================
  // FAST PATH: Local Logic
  // ============================================================

  // --- GRID COMMANDS ---
  // Matches: "grid", "show grid", "grid on", "grid number 5"
  if (lower.includes("grid")) {
    if (
      lower.includes("off") ||
      lower.includes("hide") ||
      lower.includes("remove") ||
      lower.includes("close")
    ) {
      return res.json({ action: "toggle_grid_off" });
    }

    // Check for "click grid 5" or just "grid 5"
    const numMatch = lower.match(/(\d+)/);
    if (numMatch) {
      return res.json({
        action: "click_grid",
        grid_number: parseInt(numMatch[0]),
      });
    }

    // Default: If it says "grid", turn it ON
    return res.json({ action: "toggle_grid_on" });
  }

  // --- CLICKING (Direct number) ---
  if (
    lower.startsWith("click") ||
    lower.startsWith("select") ||
    lower.startsWith("pick")
  ) {
    const numMatch = lower.match(/(\d+)/);
    if (numMatch) {
      return res.json({
        action: "click_grid",
        grid_number: parseInt(numMatch[0]),
      });
    }
  }

  // --- NOTEPAD ---
  if (lower.includes("notepad")) {
    if (lower.includes("close") || lower.includes("hide"))
      return res.json({ action: "close_notepad" });
    return res.json({ action: "open_notepad" });
  }
  if (
    lower.includes("take a note") ||
    lower.includes("new note") ||
    lower.includes("create note")
  ) {
    return res.json({ action: "take_note" });
  }

  // --- SCROLLING ---
  if (lower.includes("scroll")) {
    if (lower.includes("stop") || lower.includes("don't"))
      return res.json({ action: "none" });

    if (lower.includes("up")) return res.json({ action: "scroll_up" });
    if (lower.includes("top") || lower.includes("start"))
      return res.json({ action: "scroll_top" });
    return res.json({ action: "scroll_down" });
  }
  if (lower === "down") return res.json({ action: "scroll_down" });
  if (lower === "up") return res.json({ action: "scroll_up" });

  // --- TYPING ---
  if (lower.startsWith("type")) {
    const content = lower.replace("type", "").trim();
    if (content) return res.json({ action: "type_text", text: content });
  }

  // --- NAVIGATION ---
  if (lower.includes("dashboard"))
    return res.json({ action: "navigate", page: "dashboard" });
  if (lower.includes("browser"))
    return res.json({ action: "navigate", page: "browser" });
  if (lower.includes("home"))
    return res.json({ action: "navigate", page: "home" });
  if (lower.includes("settings"))
    return res.json({ action: "navigate", page: "settings" });

  // --- OPEN URL ---
  if (lower.startsWith("open") || lower.startsWith("go to")) {
    let url = lower.replace("open", "").replace("go to", "").trim();
    url = url.replace(" dot ", ".").replace(" point ", ".");
    return res.json({ action: "open_url", url: url });
  }

  // --- READ/SUMMARIZE ---
  if (lower.includes("read page") || lower.includes("read this"))
    return res.json({ action: "read_page" });

  if (lower.includes("summarize")) return res.json({ action: "none" }); // Disabled to prevent loops

  return res.json({ action: "none" });
});

// Dummy Summarize Route
router.post("/summarize", async (req, res) => {
  return res.json({ summary: "Summarization is currently disabled." });
});

export default router;
