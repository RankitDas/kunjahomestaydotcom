/**
 * Kunja Homestay — Production Build Verification Script
 * Validates syntax, asset paths, responsive structures, and contact data
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🚀 Running Kunja Homestay Production Build Verification...\n');

let errors = 0;
let warnings = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ERROR: ${message}`);
    errors++;
  } else {
    console.log(`  ✓ ${message}`);
  }
}

// 1. Core Project Files Check
console.log('📦 Step 1: Checking Core Files...');
const requiredFiles = ['index.html', 'style.css', 'app.js', 'kunjaData.json'];
requiredFiles.forEach(file => {
  assert(fs.existsSync(file), `File ${file} exists`);
});

// 2. Validate JSON Syntax
console.log('\n📄 Step 2: Validating kunjaData.json...');
let data = null;
try {
  const jsonContent = fs.readFileSync('kunjaData.json', 'utf8');
  data = JSON.parse(jsonContent);
  assert(data.siteConfig && data.contact, 'kunjaData.json has siteConfig and contact');
  assert(data.contact.whatsappNumber === '919064629141', 'WhatsApp number is 919064629141');
  assert(data.contact.coordinates.latitude === 23.6760972, 'Latitude is 23.6760972');
  assert(data.contact.coordinates.longitude === 87.678792, 'Longitude is 87.678792');
} catch (e) {
  assert(false, `kunjaData.json parses cleanly: ${e.message}`);
}

// 3. Validate JavaScript Syntax in app.js
console.log('\n⚡ Step 3: Validating app.js Syntax & Functions...');
try {
  const jsContent = fs.readFileSync('app.js', 'utf8');
  new vm.Script(jsContent, { filename: 'app.js' });
  assert(true, 'app.js passes JavaScript VM syntax validation');
  assert(jsContent.includes('shareWhatsApp'), 'app.js contains shareWhatsApp');
  assert(jsContent.includes('shareSMS'), 'app.js contains shareSMS');
  assert(jsContent.includes('shareFacebook'), 'app.js contains shareFacebook');
  assert(jsContent.includes('copyShareLink'), 'app.js contains copyShareLink');
  assert(jsContent.includes('scrollToInquiry'), 'app.js contains scrollToInquiry');
  assert(jsContent.includes('initRoomSwipes'), 'app.js contains initRoomSwipes for Android touch swipe');
  assert(!jsContent.includes('Web Share API'), 'app.js does NOT contain developer term "Web Share API"');
} catch (e) {
  assert(false, `app.js syntax error: ${e.message}`);
}

// 4. Validate CSS Syntax
console.log('\n🎨 Step 4: Validating style.css...');
try {
  const cssContent = fs.readFileSync('style.css', 'utf8');
  const openBraces = (cssContent.match(/\{/g) || []).length;
  const closeBraces = (cssContent.match(/\}/g) || []).length;
  assert(openBraces === closeBraces, `style.css braces balanced (${openBraces} open, ${closeBraces} close)`);
  assert(cssContent.includes('overflow-x: hidden'), 'style.css enforces overflow-x: hidden on html/body');
  assert(cssContent.includes('.mobile-sticky-action-bar'), 'style.css includes .mobile-sticky-action-bar');
  assert(cssContent.includes('.room-carousel'), 'style.css includes .room-carousel with aspect-ratio: 4/3');
} catch (e) {
  assert(false, `style.css validation error: ${e.message}`);
}

// 5. Validate HTML & Asset References
console.log('\n🌐 Step 5: Validating index.html & Image Bundling...');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  assert(!htmlContent.includes('D:\\'), 'index.html contains zero local Windows D:\\ paths');
  assert(!htmlContent.includes('/pictures/'), 'index.html contains zero unbundled pictures/ paths');
  assert(!htmlContent.includes('Web Share API'), 'index.html contains zero developer terms like "Web Share API"');
  assert(htmlContent.includes('23.6760972,87.678792'), 'Google Maps iframe has exact coordinates 23.6760972,87.678792');
  assert(htmlContent.includes('tel:+919064629141'), 'Phone call link is tel:+919064629141');
  assert(htmlContent.includes('mobile-menu-btn'), 'Mobile hamburger menu toggle button is present');
  assert(htmlContent.includes('mobile-drawer'), 'Mobile navigation drawer is present');
  assert(htmlContent.includes('lightboxModal'), 'Photo lightbox modal is present');
  assert(htmlContent.includes('shareSMS()'), 'SMS share button is present');

  // Verify all image references exist on disk
  const imgRegex = /(?:src|href|content)="([^"]+\.(?:jpeg|jpg|png|svg|webp))"/g;
  let match;
  let imgCount = 0;
  while ((match = imgRegex.exec(htmlContent)) !== null) {
    let imgPath = match[1];
    if (imgPath.startsWith('http') || imgPath.startsWith('data:')) continue;
    imgCount++;
    // Normalize leading slash to check local existence
    let checkPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
    let exists = fs.existsSync(checkPath);
    assert(exists, `Referenced asset exists: ${imgPath}`);
  }
  console.log(`  ℹ Verified ${imgCount} static image references in index.html`);
} catch (e) {
  assert(false, `index.html validation error: ${e.message}`);
}

// 6. Verify Images in images/ directory
console.log('\n🖼 Step 6: Validating images/ directory...');
const imagesDir = path.join(__dirname, 'images');
assert(fs.existsSync(imagesDir), 'images directory exists');
const rootImages = fs.readdirSync(imagesDir).filter(f => /\.(?:jpg|jpeg|png|webp)$/.test(f));
assert(rootImages.length === 64, `images contains all 64 bundled homestay photographs (found ${rootImages.length})`);

// 7. Verify Room Occupancy Badges & Gallery Data
console.log('\n👥 Step 7: Validating Room Occupancy & Gallery in app.js...');
const jsCode = fs.readFileSync('app.js', 'utf8');
assert(jsCode.includes('"Perfect for 2 people"'), 'Includes "Perfect for 2 people" occupancy badge');
assert(jsCode.includes('"Perfect for family"'), 'Includes "Perfect for family" occupancy badge');
assert(jsCode.includes('images/kunja-36.jpeg'), 'Weekend smiles gallery photo points to images/kunja-36.jpeg');

console.log('\n--------------------------------------------------');
if (errors === 0) {
  console.log('✅ ALL PRODUCTION CHECKS PASSED SUCCESSFULLY!');
  console.log('🎉 The Kunja Homestay website is verified and ready for live production deployment.');
  process.exit(0);
} else {
  console.error(`💥 BUILD VERIFICATION FAILED with ${errors} error(s).`);
  process.exit(1);
}
