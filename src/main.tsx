
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  createRoot(document.getElementById("root")!).render(<App />);
