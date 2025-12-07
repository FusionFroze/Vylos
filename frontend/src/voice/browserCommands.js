export function processBrowserCommands(cmd, actions) {
  // cmd is already lowercased from the caller

  if (!cmd) return false;

  // -----------------------------
  // 1. Back / Forward
  // -----------------------------
  // Note: App.js actions don't explicitly have browserBack/Forward yet,
  // so we fallback to window.history to ensure it works.
  if (
    cmd === "go back" ||
    (cmd.includes("back") && !cmd.includes("background"))
  ) {
    if (actions.browserBack) actions.browserBack();
    else window.history.back(); // Fallback
    return true;
  }

  if (cmd === "go forward" || cmd.includes("forward")) {
    if (actions.browserForward) actions.browserForward();
    else window.history.forward(); // Fallback
    return true;
  }

  // -----------------------------
  // 2. Scrolling
  // -----------------------------
  if (cmd.includes("scroll down") || cmd === "down") {
    actions.scrollDown?.();
    return true;
  }

  if (cmd.includes("scroll up") || cmd === "up") {
    actions.scrollUp?.();
    return true;
  }

  if (cmd.includes("scroll to top") || cmd.includes("go to top")) {
    actions.scrollTop?.();
    return true;
  }

  // -----------------------------
  // 3. Open Site Logic
  // -----------------------------
  if (cmd.startsWith("open ") || cmd.startsWith("go to ")) {
    let site = cmd.replace("open ", "").replace("go to ", "").trim();

    // A) Check Internal Routes (Let the main processor handle these via 'navigate')
    const internalRoutes = [
      "dashboard",
      "settings",
      "macros",
      "summarize",
      "browser",
      "home",
      "login",
      "register",
    ];
    if (internalRoutes.includes(site)) {
      return false; // Return false so commandProcessor.js handles it
    }

    // B) Popular Shortcuts Mapping
    const popular = {
      cnn: "https://www.cnn.com",
      bbc: "https://www.bbc.com",
      google: "https://www.google.com",
      youtube: "https://www.youtube.com",
      twitter: "https://twitter.com",
      x: "https://twitter.com",
      reddit: "https://www.reddit.com",
      wiki: "https://en.wikipedia.org/wiki/Main_Page",
      wikipedia: "https://en.wikipedia.org/wiki/Main_Page",
      nasa: "https://www.nasa.gov",
      amazon: "https://www.amazon.com",
      facebook: "https://www.facebook.com",
      linkedin: "https://www.linkedin.com",
      netflix: "https://www.netflix.com",
    };

    if (popular[site]) {
      actions.openUrl?.(popular[site]);
      return true;
    }

    // C) Handle Spoken URLs (e.g. "google dot com")
    // Remove spaces and replace spoken "dot"
    let cleanSite = site.replace(/\s+/g, "").replace("dot", ".");

    if (cleanSite.includes(".")) {
      if (!cleanSite.startsWith("http")) {
        cleanSite = "https://" + cleanSite;
      }
      actions.openUrl?.(cleanSite);
      return true;
    }

    // D) Fallback: Append .com
    actions.openUrl?.("https://" + cleanSite + ".com");
    return true;
  }

  // -----------------------------
  // 4. Grid Clicks
  // -----------------------------
  // Matches "click 5" or "click number 5"
  const clickMatch = cmd.match(/click (?:number )?(\d+)/);
  if (clickMatch) {
    const num = parseInt(clickMatch[1], 10);
    if (!isNaN(num)) {
      // Use the generic gridClick from App.js
      actions.gridClick?.(num);
      return true;
    }
  }

  return false;
}
