import "./polyfills";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global uncaught error fallback to prevent silent blank screens
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const rootEl = document.getElementById("root");
    if (rootEl && (!rootEl.hasChildNodes() || rootEl.innerHTML.trim() === "")) {
      rootEl.innerHTML = `
        <div style="min-height: 100vh; background: #070707; color: #f5f5f5; font-family: monospace; display: flex; align-items: center; justify-content: center; padding: 24px;">
          <div style="max-width: 600px; width: 100%; border: 1px solid #333; background: #0d0e12; padding: 24px; border-radius: 8px;">
            <div style="color: #f59e0b; font-weight: bold; margin-bottom: 12px;">[FLINT INITIALIZATION WARNING]</div>
            <div style="font-size: 14px; margin-bottom: 16px; color: #aaa;">The application encountered a startup error:</div>
            <pre style="background: #151821; padding: 12px; border-radius: 4px; overflow: auto; font-size: 12px; color: #ef4444;">${event.message || "Unknown error"}</pre>
            <button onclick="window.location.reload()" style="margin-top: 16px; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-family: monospace;">Reload Application</button>
          </div>
        </div>
      `;
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);

