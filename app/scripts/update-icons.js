const path = require('path');
const fs = require('fs');

const appDir = path.resolve(__dirname, '..');
const assetsDir = path.join(appDir, 'assets');

// 1. Fix double extensions if present (.png.png -> .png)
const iconPngPng = path.join(assetsDir, 'icon.png.png');
const iconPng = path.join(assetsDir, 'icon.png');
if (fs.existsSync(iconPngPng)) {
  fs.copyFileSync(iconPngPng, iconPng);
  console.log('Copied icon.png.png -> icon.png');
}

const adaptivePngPng = path.join(assetsDir, 'adaptive-icon.png.png');
const adaptivePng = path.join(assetsDir, 'adaptive-icon.png');
if (fs.existsSync(adaptivePngPng)) {
  fs.copyFileSync(adaptivePngPng, adaptivePng);
  console.log('Copied adaptive-icon.png.png -> adaptive-icon.png');
}

// 2. Call Expo's setIconAsync to generate all Android mipmap icons and XML files
const { setIconAsync } = require('@expo/prebuild-config/build/plugins/icons/withAndroidIcons');

async function main() {
  console.log('Generating Android icons from assets...');
  await setIconAsync(appDir, {
    icon: './assets/icon.png',
    foregroundImage: './assets/adaptive-icon.png',
    backgroundColor: '#ffffff',
    isAdaptive: true
  });
  console.log('Successfully generated Android icons from assets!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
