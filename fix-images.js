const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');
  const before = html;

  // Strip the Next.js image-optimizer wrapper from src="..."
  html = html.replace(/src="\/_next\/image\?url=([^"&]+)(&[^"]*)?"/g, (_, url) => {
    return `src="${decodeURIComponent(url)}"`;
  });

  // Remove srcSet attributes entirely (not needed for a static server)
  html = html.replace(/\s+srcSet="[^"]*"/gi, '');
  html = html.replace(/\s+srcset="[^"]*"/gi, '');

  if (html !== before) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Fixed:', filePath);
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) fixFile(full);
  }
}

walk(process.cwd());