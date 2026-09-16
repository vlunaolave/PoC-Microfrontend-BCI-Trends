import { loadEnv } from "vite";

export function sharedReact() {
  return {
    react: { singleton: true, requiredVersion: "^18.3.1" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
  };
}

export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

export function readShellEnv(mode: string, cwd: string) {
  return loadEnv(mode, cwd, "VITE_");
}
