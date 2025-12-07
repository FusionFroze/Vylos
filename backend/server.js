import "./config.js";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import settingsRoutes from "./src/routes/settings.js";
import macrosRoutes from "./src/routes/macros.js";
import aiRoutes from "./src/routes/ai.js";
import proxyRouter from "./src/routes/proxy.js";
import notesRouter from "./src/routes/notes.js"; // ✅ Import Notes

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.json({ message: "VoiceWeb backend running ✅" });
});

// Routes
app.use("/proxy", proxyRouter);
app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/macros", macrosRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", notesRouter); // Register Notes Route

const PORT = process.env.PORT || 5000;

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Vylos server listening on port ${PORT}`);
});
