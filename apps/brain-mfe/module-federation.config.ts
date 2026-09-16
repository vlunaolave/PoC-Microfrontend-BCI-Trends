export function sharedReact() {
  return {
    react: { singleton: true, requiredVersion: "^18.3.1" },
    "react-dom": { singleton: true, requiredVersion: "^18.3.1" },
  };
}

export default {
  name: "brain_mfe",
  filename: "remoteEntry.js",
  exposes: {
    "./BrainApp": "./src/BrainApp.tsx",
  },
  shared: sharedReact(),
};
