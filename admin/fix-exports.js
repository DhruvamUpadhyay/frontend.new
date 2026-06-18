const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('a:\\FBP\\admin\\src\\app', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix exports
    content = content.replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>/g, 'export default function $1()');
    
    // Fix router.push('/admin/dashboard') -> router.push('/')
    content = content.replace(/router\.push\(['"]\/admin\/dashboard['"]\)/g, "router.push('/')");
    // Fix any other /admin/... links or pushes
    content = content.replace(/['"]\/admin\/([^'"]+)['"]/g, "'/$1'");
    
    fs.writeFileSync(filePath, content);
  }
});
