/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BODY_REMOTE_URL: string;
  readonly VITE_BRAIN_REMOTE_URL: string;
  readonly VITE_SIGNAL_REMOTE_URL: string;
  readonly VITE_DECODER_REMOTE_URL: string;
  readonly VITE_DEMO_TIMING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
