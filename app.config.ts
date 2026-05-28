import type { ConfigContext, ExpoConfig } from "expo/config";
import packageJson from "./package.json";

const version = packageJson.version;

function getBuildNumber(): string {
  if (process.env.APP_BUILD_NUMBER) return process.env.APP_BUILD_NUMBER;
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

// Android versionCode must be a positive 32-bit integer.
// Minutes since 2024-01-01 gives ~4,000 years of headroom.
function getVersionCode(): number {
  if (process.env.APP_BUILD_NUMBER) return parseInt(process.env.APP_BUILD_NUMBER, 10);
  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - epoch) / 60_000);
}

const buildNumber = getBuildNumber();
const versionCode = getVersionCode();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Bag Count",
  slug: "bag-count",
  scheme: "bag-count",
  version,
  orientation: "default",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#090D16",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.brannonglover.bagcount",
    buildNumber,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.brannonglover.bagcount",
    versionCode,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router", "./plugins/withDynamicVersioning"],
  extra: {
    router: {},
    eas: {
      projectId: "5674bab2-1aa3-4680-a05f-5ac9beed8e14",
    },
  },
});
