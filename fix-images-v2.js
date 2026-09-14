const fs = require('fs');
const path = require('path');

function fixNextImageUrls(content) {
  return content.replace(/\/_next\/image\?url=([^"'\\]*)/g, (_, raw) => {
    const urlPart = raw.split(/&amp;|&|\\u0026/)[0];
    try {
      return decodeURIComponent(urlPart);
    } catch (e) {
      return urlPart;
    }
  });
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;

  content = fixNextImageUrls(content);

  if (filePath.endsWith('.html')) {
    content = content.replace(/\s+srcSet="[^"]*"/gi, '');
    content = content.replace(/\s+srcset="[^"]*"/gi, '');
  }

  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      walk(full);
    } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.js'))) {
      fixFile(full);
    }
  }
}

walk(process.cwd());