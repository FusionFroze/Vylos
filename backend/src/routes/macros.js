import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all macros
router.get("/", auth, async (req, res) => {
  try {
    const macros = await prisma.macro.findMany({
      where: { userId: req.userId },
    });

    // FIX: Parse the 'actions' string back into JSON object for the frontend
    const parsedMacros = macros.map((m) => ({
      ...m,
      actions: JSON.parse(m.actions || "[]"),
    }));

    res.json(parsedMacros);
  } catch (err) {
    console.error("Get macros error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE macro
router.post("/", auth, async (req, res) => {
  try {
    const { name, trigger, actions } = req.body;

    // FIX: Stringify the JSON object before saving to SQLite
    const actionsString = JSON.stringify(actions);

    const macro = await prisma.macro.create({
      data: {
        userId: req.userId,
        name,
        trigger,
        actions: actionsString,
      },
    });

    // Return it as an object
    res.json({ ...macro, actions: JSON.parse(macro.actions) });
  } catch (err) {
    console.error("Create macro error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE macro
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.macro.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error deleting macro" });
  }
});

export default router;
