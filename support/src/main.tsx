import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocaleProvider } from "@/i18n";
import { ThemeProvider } from "@/components/ThemeProvider";
import { App } from "./App";
import "../../src/styles.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </LocaleProvider>
  </StrictMode>,
);
