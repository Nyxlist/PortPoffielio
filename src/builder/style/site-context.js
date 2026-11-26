import { createContext, useContext } from "react";

/** The site being edited, so editor controls (e.g. color swatches) can show the real theme. */
export const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);
