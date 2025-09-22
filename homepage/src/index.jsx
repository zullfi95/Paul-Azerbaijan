import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HomepageHifi } from "./screens/HomepageHifi";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <HomepageHifi />
  </StrictMode>,
);
