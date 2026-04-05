import {registerRootComponent} from "expo";
import {ExpoRoot} from "expo-router";

// ⚠️  This MUST be imported here — at the true entry point — before anything
// else runs. The headless task fires before _layout.tsx loads, so registering
// there is already too late.
import "./services/notification/notification-service.ts";

export function App() {
  const ctx = require.context("./app");
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
