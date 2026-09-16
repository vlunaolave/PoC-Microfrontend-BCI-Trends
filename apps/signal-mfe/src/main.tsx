import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@neuromfe/design-tokens/tokens.css";
import SignalApp from "./SignalApp";
import { isEmbeddedInShell } from "@neuromfe/contracts";

const root = document.getElementById("root");
if (!root) {
  throw new Error("No se encontró #root");
}

createRoot(root).render(
  <StrictMode>
    <div style={{ minHeight: "100vh", padding: isEmbeddedInShell() ? 0 : 16 }}>
      {!isEmbeddedInShell() ? (
        <p style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 0 }}>
          Standalone Micro Frontend · Signal MFE · localhost:3003
        </p>
      ) : null}
      <div style={{ height: "calc(100vh - 48px)", background: "var(--bg-panel)", borderRadius: 16 }}>
        <SignalApp />
      </div>
    </div>
  </StrictMode>,
);
