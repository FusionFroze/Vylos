import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET /api/settings
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });
    res.json(settings);
  } catch (err) {
    console.error("Get settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/settings (create or update)
router.post("/", auth, async (req, res) => {
  try {
    const userId = req.userId;
    const { fontSize, highContrast, darkMode, ttsRate, ttsPitch, ttsLang } =
      req.body;

    const existing = await prisma.settings.findUnique({ where: { userId } });

    const data = {
      userId,
      fontSize: fontSize ?? undefined,
      highContrast: highContrast ?? undefined,
      darkMode: darkMode ?? undefined,
      ttsRate: ttsRate ?? undefined,
      ttsPitch: ttsPitch ?? undefined,
      ttsLang: ttsLang ?? undefined,
    };

    let settings;
    if (existing) {
      settings = await prisma.settings.update({
        where: { userId },
        data,
      });
    } else {
      settings = await prisma.settings.create({ data });
    }

    res.json(settings);
  } catch (err) {
    console.error("Update settings error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
