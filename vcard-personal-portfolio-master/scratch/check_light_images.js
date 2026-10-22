const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\venka\\.gemini\\antigravity-ide\\brain\\e4835ba0-bcd1-4405-a1f0-2e19d9c20721\\.user_uploaded';
const files = fs.readdirSync(dir)
  .filter(f => f.startsWith('media_1792601'))
  .map(f => {
    const stat = fs.statSync(path.join(dir, f));
    return { name: f, size: stat.size, mtime: stat.mtimeMs };
  })
  .sort((a, b) => a.mtime - b.mtime);

console.log(JSON.stringify(files, null, 2));
