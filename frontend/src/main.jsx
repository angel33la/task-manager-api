import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "../../imports/ui/App.jsx";
import "../../imports/ui/styles.css";

document.documentElement.lang = "en";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
