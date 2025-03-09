import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { UserProvider }  from "./pages/context/UserContext"; // ✅ Import UserProvider

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider> {/* ✅ Wrap App inside UserProvider */}
      <App />
    </UserProvider>
  </StrictMode>
);