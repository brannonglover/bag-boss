const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), "utf8"));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(
    path.join(projectRoot, relativePath),
    `${JSON.stringify(value, null, 2)}\n`,
  );
}

function getBuildNumber() {
  if (process.env.APP_BUILD_NUMBER) return process.env.APP_BUILD_NUMBER;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
}

// Android versionCode must be a positive 32-bit integer.
// Minutes since 2024-01-01 gives ~4,000 years of headroom.
function getVersionCode() {
  if (process.env.APP_BUILD_NUMBER) return parseInt(process.env.APP_BUILD_NUMBER, 10);

  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - epoch) / 60_000);
}

function syncExpoConfig(version, buildNumber, versionCode) {
  const appJson = readJson("app.json");

  appJson.expo.version = version;
  appJson.expo.ios = {
    ...appJson.expo.ios,
    buildNumber,
  };
  appJson.expo.android = {
    ...appJson.expo.android,
    versionCode,
  };

  writeJson("app.json", appJson);
}

function syncInfoPlist() {
  const plistPath = path.join(projectRoot, "ios/BagCount/Info.plist");
  let contents = fs.readFileSync(plistPath, "utf8");

  contents = contents.replace(
    /(<key>CFBundleShortVersionString<\/key>\s*<string>)([^<]+)(<\/string>)/,
    "$1$(MARKETING_VERSION)$3",
  );
  contents = contents.replace(
    /(<key>CFBundleVersion<\/key>\s*<string>)([^<]+)(<\/string>)/,
    "$1$(CURRENT_PROJECT_VERSION)$3",
  );

  fs.writeFileSync(plistPath, contents);
}

function syncXcodeProject(version, buildNumber) {
  const pbxprojPath = path.join(projectRoot, "ios/BagCount.xcodeproj/project.pbxproj");
  let contents = fs.readFileSync(pbxprojPath, "utf8");

  contents = contents.replace(
    /CURRENT_PROJECT_VERSION = [^;]+;/g,
    `CURRENT_PROJECT_VERSION = ${buildNumber};`,
  );
  contents = contents.replace(
    /MARKETING_VERSION = [^;]+;/g,
    `MARKETING_VERSION = ${version};`,
  );

  fs.writeFileSync(pbxprojPath, contents);
}

const packageJson = readJson("package.json");
const version = packageJson.version;
const buildNumber = getBuildNumber();
const versionCode = getVersionCode();

syncExpoConfig(version, buildNumber, versionCode);
syncInfoPlist();
syncXcodeProject(version, buildNumber);

console.log(`Synced version ${version} with build ${buildNumber}.`);
