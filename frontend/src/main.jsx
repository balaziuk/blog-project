import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ThemeRegistry } from "./theme-registry.jsx";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeRegistry>
      <App />
    </ThemeRegistry>
  </React.StrictMode>
);
