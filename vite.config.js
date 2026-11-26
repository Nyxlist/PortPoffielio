import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// One app: the public site at every address, and the editor at /admin.
// appType "spa" serves index.html for any path, so /about etc. work in dev and preview.
// BASE_PATH: the sub-folder the site is published under, e.g. "/PortPoffielio/" on
// GitHub Pages (set by .github/workflows/deploy-pages.yml). Leave it unset for a normal domain.
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  appType: "spa",
  plugins: [react(), tailwindcss()],
});
