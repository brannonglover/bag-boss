#!/usr/bin/env node
/**
 * Syncs version metadata across package.json, app.json, and (when present) the iOS
 * Xcode project. During EAS iOS builds, we also stamp a fresh build number so App
 * Store submissions do not reuse an old build.
 *
 * When /ios is gitignored, EAS generates native projects during prebuild (after this
 * hook). In that case app.config.ts + withDynamicVersioning apply version/build values.
 *
 * Run manually with: node scripts/sync-version.js
 * Include a fresh iOS build number with: node scripts/sync-version.js --with-build-number
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const appJsonPath = path.join(rootDir, "app.json");
const iosProjectPath = path.join(rootDir, "ios", "BagCount.xcodeproj", "project.pbxproj");
const includeBuildNumber = process.argv.includes("--with-build-number");

function getBuildNumber() {
  if (process.env.APP_BUILD_NUMBER) return process.env.APP_BUILD_NUMBER;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function getVersionCode() {
  if (process.env.APP_BUILD_NUMBER) return parseInt(process.env.APP_BUILD_NUMBER, 10);

  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - epoch) / 60_000);
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceAllOrThrow(contents, pattern, replaceWith, label) {
  if (!pattern.test(contents)) {
    throw new Error(`Unable to find ${label} in ${path.basename(iosProjectPath)}`);
  }
  return contents.replace(pattern, replaceWith);
}

function syncXcodeProject(version, buildNumber) {
  if (!fs.existsSync(iosProjectPath)) {
    console.log("Skipping Xcode project sync (ios/ not present; EAS prebuild will apply versions from app.config.ts)");
    return;
  }

  let iosProject = fs.readFileSync(iosProjectPath, "utf8");
  iosProject = replaceAllOrThrow(
    iosProject,
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${version};`,
    "MARKETING_VERSION",
  );

  if (includeBuildNumber) {
    iosProject = replaceAllOrThrow(
      iosProject,
      /CURRENT_PROJECT_VERSION = [^;]+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`,
      "CURRENT_PROJECT_VERSION",
    );
  }

  fs.writeFileSync(iosProjectPath, iosProject);
  console.log(`Synced ios/BagCount.xcodeproj/project.pbxproj (MARKETING_VERSION = ${version}${includeBuildNumber ? `, CURRENT_PROJECT_VERSION = ${buildNumber}` : ""})`);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;
const buildNumber = getBuildNumber();
const versionCode = getVersionCode();

const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf8"));
appJson.expo.version = version;

if (includeBuildNumber) {
  appJson.expo.ios = {
    ...appJson.expo.ios,
    buildNumber,
  };
  appJson.expo.android = {
    ...appJson.expo.android,
    versionCode,
  };
}

writeJson(appJsonPath, appJson);

syncXcodeProject(version, buildNumber);

console.log(`Synced version ${version} to app.json`);
if (includeBuildNumber) {
  console.log(`Stamped iOS buildNumber ${buildNumber} and Android versionCode ${versionCode} in app.json`);
}
