import express from "express";
import prisma from "../prisma.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all notes for user
router.get("/", auth, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: "desc" },
    });
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// Create a new note
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await prisma.note.create({
      data: {
        userId: req.userId,
        title: title || "Untitled Note",
        content: content || "",
      },
    });
    res.json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// Update a note
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    // Verify ownership
    const existing = await prisma.note.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const note = await prisma.note.update({
      where: { id: Number(id) },
      data: { title, content },
    });
    res.json(note);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete a note
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    // Verify ownership
    const existing = await prisma.note.findUnique({
      where: { id: Number(id) },
    });
    if (!existing || existing.userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await prisma.note.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

export default router;
