import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import mf from "./module-federation.config";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default defineConfig({
  plugins: [react(), federation(mf)],
  server: {
    port: 3001,
    strictPort: true,
    origin: "http://localhost:3001",
    cors: true,
    headers: corsHeaders,
    fs: { allow: ["../.."] },
  },
  preview: {
    port: 3001,
    strictPort: true,
    cors: true,
    headers: corsHeaders,
  },
  build: {
    target: "esnext",
    modulePreload: false,
  },
});
