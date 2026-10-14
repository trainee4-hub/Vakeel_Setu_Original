import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import AppStoreProvider from "./store/AppStoreProvider";

import "./index.css";

createRoot(document.getElementById("root")).render(
  
    <AppStoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppStoreProvider>
);