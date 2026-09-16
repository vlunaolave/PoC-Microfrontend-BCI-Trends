import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import { corsHeaders, readShellEnv, sharedReact } from "./module-federation.config";

export default defineConfig(({ mode }) => {
  const env = readShellEnv(mode, process.cwd());
  return {
    plugins: [
      react(),
      federation({
        name: "shell",
        remotes: {
          body_mfe: {
            type: "module",
            name: "body_mfe",
            entry: env.VITE_BODY_REMOTE_URL || "http://localhost:3001/remoteEntry.js",
          },
          brain_mfe: {
            type: "module",
            name: "brain_mfe",
            entry: env.VITE_BRAIN_REMOTE_URL || "http://localhost:3002/remoteEntry.js",
          },
          signal_mfe: {
            type: "module",
            name: "signal_mfe",
            entry: env.VITE_SIGNAL_REMOTE_URL || "http://localhost:3003/remoteEntry.js",
          },
          decoder_mfe: {
            type: "module",
            name: "decoder_mfe",
            entry: env.VITE_DECODER_REMOTE_URL || "http://localhost:3004/remoteEntry.js",
          },
        },
        shared: sharedReact(),
      }),
    ],
    server: {
      port: 3000,
      strictPort: true,
      origin: "http://localhost:3000",
      cors: true,
      headers: corsHeaders(),
      fs: { allow: ["../.."] },
    },
    preview: {
      port: 3000,
      strictPort: true,
      cors: true,
      headers: corsHeaders(),
    },
    build: {
      target: "esnext",
      modulePreload: false,
    },
  };
});
