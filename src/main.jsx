import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Providers from "./providers/Providers";

createRoot(document.getElementById("root")).render(
  <Providers>
    <App />
  </Providers>
);
