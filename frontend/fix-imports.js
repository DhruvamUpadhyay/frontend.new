const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const srcDir = 'a:\\FBP\\frontend\\src';
walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix imports using regex
    content = content.replace(/from\s+['"](?:\.\.\/)+(assets|components|config|layouts|pages)([^'"]*)['"]/g, "from '@/$1$2'");
    content = content.replace(/from\s+['"]\.\/(assets|components|config|layouts|pages)([^'"]*)['"]/g, "from '@/$1$2'");
    
    fs.writeFileSync(filePath, content);
  }
});
