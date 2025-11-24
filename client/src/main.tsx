import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Vite HMR errors in development (non-blocking, doesn't affect app)
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Failed to construct \'WebSocket\'') && 
      event.reason?.message?.includes('localhost:undefined')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
