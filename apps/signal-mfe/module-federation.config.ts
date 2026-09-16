export function sharedReact() {
  return {
    react: { singleton: true, requiredVersion: "^18.3.1" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
  };
}

export default {
  name: "signal_mfe",
  filename: "remoteEntry.js",
  exposes: {
    "./SignalApp": "./src/SignalApp.tsx",
  },
  shared: sharedReact(),
};
