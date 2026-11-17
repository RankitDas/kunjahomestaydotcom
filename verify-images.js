#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const imageDir = path.join(root, 'images');
const files = fs.readdirSync(imageDir);
const exactNames = new Set(files);
const allowedExtension = /\.(?:jpg|jpeg|png|webp)$/;
const errors = [];

if (files.length !== 64) errors.push(`Expected 64 files in images/, found ${files.length}`);
for (const name of files) {
  if (!allowedExtension.test(name) || name !== name.toLowerCase() || !/^kunja-\d{2}\.(?:jpg|jpeg|png|webp)$/.test(name)) {
    errors.push(`Invalid image filename: ${name}`);
  }
}

const imageReference = /(?:^|["'\s(=])((?:\.\/)?images\/[A-Za-z0-9._-]+\.(?:jpg|jpeg|png|webp))/g;
let references = 0;
for (const source of ['kunjaData.json', 'index.html', 'app.js']) {
  const content = fs.readFileSync(path.join(root, source), 'utf8');
  for (const match of content.matchAll(imageReference)) {
    const imagePath = match[1];
    references++;
    if (imagePath !== imagePath.toLowerCase() || !imagePath.startsWith('images/')) {
      errors.push(`${source}: path must be lowercase and start with images/: ${imagePath}`);
    }
    const name = imagePath.slice('images/'.length);
    if (!exactNames.has(name)) errors.push(`${source}: exact-case file missing for ${imagePath}`);
    else if (!fs.existsSync(path.join(imageDir, name))) errors.push(`${source}: file missing: ${imagePath}`);
  }
}

if (!references) errors.push('No image references found');
if (errors.length) {
  console.error(errors.map(error => `FAIL: ${error}`).join('\n'));
  process.exit(1);
}

console.log(`PASS: ${references} image references resolve exactly; 64 lowercase image files present; zero missing files.`);
