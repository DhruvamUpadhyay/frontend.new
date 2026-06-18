const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('a:\\FBP\\frontend\\src\\app', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix export function -> export default function
    content = content.replace(/export\s+function\s+([A-Za-z0-9_]+)\s*\(/g, 'export default function $1(');
    
    fs.writeFileSync(filePath, content);
  }
});
