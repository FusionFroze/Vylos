import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const router = express.Router();

/**
 * GET /proxy?url=<encoded target URL>
 */
router.get("/", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).send("Missing url query parameter");
  }

  try {
    const upstream = await axios.get(targetUrl, {
      responseType: "arraybuffer",
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) VoiceWeb/1.0",
        "Accept-Language": req.headers["accept-language"] || "en-US,en;q=0.9",
      },
    });

    const status = upstream.status || 200;
    const contentType = upstream.headers["content-type"] || "";

    // Pass through non-HTML directly
    if (!contentType.includes("text/html")) {
      res.status(status);
      Object.entries(upstream.headers).forEach(([k, v]) => {
        if (k.toLowerCase() === "content-encoding") return;
        res.setHeader(k, v);
      });
      return res.send(Buffer.from(upstream.data));
    }

    let html = upstream.data.toString("utf8");
    const $ = cheerio.load(html, { decodeEntities: false });

    // --- URL Rewriting Logic ---
    const rewriteUrl = (orig) => {
      if (!orig) return orig;
      if (
        orig.startsWith("#") ||
        orig.startsWith("javascript:") ||
        orig.startsWith("mailto:")
      ) {
        return orig;
      }
      try {
        const abs = new URL(orig, targetUrl).toString();
        return "/proxy?url=" + encodeURIComponent(abs);
      } catch {
        return orig;
      }
    };

    $("a[href]").each((_, el) => {
      $(el).attr("href", rewriteUrl($(el).attr("href")));
    });
    $("link[href]").each((_, el) => {
      $(el).attr("href", rewriteUrl($(el).attr("href")));
    });
    $("script[src]").each((_, el) => {
      $(el).attr("src", rewriteUrl($(el).attr("src")));
    });
    $("img[src]").each((_, el) => {
      $(el).attr("src", rewriteUrl($(el).attr("src")));
    });
    $("form[action]").each((_, el) => {
      $(el).attr("action", rewriteUrl($(el).attr("action")));
    });

    // --- Injected Script ---
    const injectedScript = `
      (function () {
        // 1. Send Page Text extraction
        function sendText() {
          try {
            var main =
              document.querySelector("article") ||
              document.querySelector("#content") ||
              document.querySelector("main") ||
              document.body;

            var text = main ? main.innerText : "";
            // Limit text size to prevent massive payloads
            window.parent.postMessage({ type: "page_text", text: text.substring(0, 50000) }, "*");
          } catch (e) {
            console.error("page_text error", e);
          }
        }

        // 2. Listen for Actions from React
        window.addEventListener("message", function (event) {
          var data = event.data || {};
          if (!data.action) return;

          if (data.action === "scroll_down") {
            window.scrollBy({ top: 300, behavior: 'smooth' });
          } else if (data.action === "scroll_up") {
            window.scrollBy({ top: -300, behavior: 'smooth' });
          } else if (data.action === "scroll_top") {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } 
          
          // --- ROBUST CLICK HANDLING ---
          else if (data.action === "click_xy") {
            try {
              var x = data.x;
              var y = data.y;
              
              // A. Find the element
              var el = document.elementFromPoint(x, y);

              // B. Visual Debugging (Show a red dot where we clicked)
              var dot = document.createElement('div');
              dot.style.position = 'fixed';
              dot.style.left = (x - 5) + 'px';
              dot.style.top = (y - 5) + 'px';
              dot.style.width = '10px';
              dot.style.height = '10px';
              dot.style.backgroundColor = 'red';
              dot.style.borderRadius = '50%';
              dot.style.zIndex = '2147483647';
              dot.style.pointerEvents = 'none';
              dot.style.boxShadow = '0 0 5px white';
              document.body.appendChild(dot);
              setTimeout(function(){ dot.remove(); }, 1500);

              if (el) {
                // C. Focus if it's an input
                if (['INPUT', 'TEXTAREA', 'SELECT'].indexOf(el.tagName) !== -1) {
                   el.focus();
                }

                // D. Dispatch full event sequence (mousedown -> mouseup -> click)
                // This tricks frameworks like React into accepting the click
                var clickOpts = {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: x,
                  clientY: y
                };
                
                el.dispatchEvent(new MouseEvent('mousedown', clickOpts));
                el.dispatchEvent(new MouseEvent('mouseup', clickOpts));
                el.click();
              }
            } catch (e) {
              console.error("click_xy error", e);
            }
          } 
          
          else if (data.action === "type_text") {
             // ... existing type logic ...
             try {
              var el = document.activeElement;
              if (
                !el ||
                (el.tagName !== "INPUT" &&
                  el.tagName !== "TEXTAREA" &&
                  el.contentEditable !== "true")
              ) {
                // Try to find a search box if nothing is focused
                el = document.querySelector("input[type='search']") ||
                     document.querySelector("input[type='text']") ||
                     document.querySelector("textarea");
              }

              if (el) {
                var start = el.selectionStart || el.value.length;
                var val = el.value || "";
                var textToAdd = data.text || "";
                
                el.value = val.substring(0, start) + " " + textToAdd + val.substring(start);
                
                // Dispatch input event for React/Angular/Vue to detect change
                el.dispatchEvent(new Event("input", { bubbles: true }));
                el.dispatchEvent(new Event("change", { bubbles: true }));
              }
            } catch (e) { console.error("type error", e); }
          }
        });

        // Initialize
        window.addEventListener("load", function () { setTimeout(sendText, 1000); });
        setTimeout(sendText, 3000); // Fallback
      })();
    `;

    $("body").append(`<script>${injectedScript}</script>`);

    const finalHtml = $.html();

    res.status(status);
    res.setHeader("content-type", "text/html; charset=utf-8");
    return res.send(finalHtml);
  } catch (err) {
    console.error("Proxy error for", targetUrl, err.message);
    return res.status(500).send("Proxy error: " + err.message);
  }
});

export default router;
