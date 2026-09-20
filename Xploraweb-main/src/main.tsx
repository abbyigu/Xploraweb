
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { i18nReady } from "./app/i18n";
  import "./styles/index.css";

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  // Wait for the detected language bundle so first paint never shows raw keys.
  i18nReady.finally(() => createRoot(document.getElementById("root")!).render(<App />));
  