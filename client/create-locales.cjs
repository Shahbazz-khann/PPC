const fs = require('fs');
const path = require('path');

const namespaces = [
  'common',
  'public',
  'dashboard',
  'properties',
  'requests',
  'visits',
  'inspectionReports',
  'verificationReports',
  'profile'
];

const localesDir = path.join(__dirname, 'src', 'locales');
const enDir = path.join(localesDir, 'en');
const urDir = path.join(localesDir, 'ur');

if (!fs.existsSync(localesDir)) fs.mkdirSync(localesDir);
if (!fs.existsSync(enDir)) fs.mkdirSync(enDir);
if (!fs.existsSync(urDir)) fs.mkdirSync(urDir);

namespaces.forEach(ns => {
  const fileContent = '{\n}\n';
  fs.writeFileSync(path.join(enDir, `${ns}.json`), fileContent);
  fs.writeFileSync(path.join(urDir, `${ns}.json`), fileContent);
});

console.log('Locale files created successfully.');
