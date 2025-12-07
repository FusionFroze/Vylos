import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { fork } from "child_process"; // ✅ Use fork to spawn server safely
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env
dotenv.config({ path: path.join(__dirname, ".env") });

let serverProcess;

function startApp() {
  // 1. Start the Server
  serverProcess = fork(path.join(__dirname, "server.js"), [], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
  });

  // 2. Wait for server to be ready, then launch SYSTEM BROWSER
  // We don't create a 'BrowserWindow' here. We use the user's Chrome/Edge.
  setTimeout(() => {
    console.log("Opening System Browser...");
    shell.openExternal("http://localhost:5000");
  }, 2000);
}

app.whenReady().then(() => {
  startApp();
});

// Keep the background process alive even though no electron window is open
// (Users will have to close the terminal or task to stop it,
//  or you can add a small "Tray Icon" to close it)
app.on("window-all-closed", (e) => {
  e.preventDefault(); // Don't quit automatically
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
