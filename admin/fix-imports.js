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
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix api client imports
    content = content.replace(/import\s+\{\s*apiClient\s*\}\s+from\s+['"](?:\.\.\/)+api\/client['"];/g, "import { apiClient } from '@/api/client';");
    
    // Fix firebase config imports
    content = content.replace(/import\s+\{\s*auth\s*\}\s+from\s+['"](?:\.\.\/)+config\/firebase['"];/g, "import { auth } from '@/config/firebase';");
    content = content.replace(/import\s+\{\s*db\s*\}\s+from\s+['"](?:\.\.\/)+config\/firebase['"];/g, "import { db } from '@/config/firebase';");
    content = content.replace(/import\s+\{\s*storage\s*\}\s+from\s+['"](?:\.\.\/)+config\/firebase['"];/g, "import { storage } from '@/config/firebase';");
    
    fs.writeFileSync(filePath, content);
  }
});
