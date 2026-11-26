import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./styles/main.css";
import { SiteApp } from "./site/SiteApp.jsx";
import { stripBase } from "./lib/base-path.js";

// The editor is only downloaded when someone opens /admin.
const EditorApp = lazy(() => import("./editor/EditorApp.jsx"));
const path = stripBase(location.pathname);
const isEditor = path === "/admin" || path.startsWith("/admin/");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isEditor ? (
      <Suspense fallback={null}>
        <EditorApp />
      </Suspense>
    ) : (
      <SiteApp />
    )}
  </StrictMode>,
);
