export function sharedReact() {
  return {
    react: { singleton: true, requiredVersion: "^18.3.1" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
  };
}

export default {
  name: "decoder_mfe",
  filename: "remoteEntry.js",
  exposes: {
    "./DecoderApp": "./src/DecoderApp.tsx",
  },
  shared: sharedReact(),
  dts: false,
  bundleAllCSS: true,
};
