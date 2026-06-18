const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('a:\\FBP\\frontend\\src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert useLocation to usePathname
    if (content.includes('useLocation')) {
      content = '"use client";\n' + content;
      content = content.replace(/import\s+\{([^}]*)useLocation([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import { usePathname } from 'next/navigation';\nimport Link from 'next/link';");
      content = content.replace(/const\s+location\s*=\s*useLocation\(\);?/g, "const pathname = usePathname();\n  const location = { pathname };");
    }
    
    // Replace Link imports
    content = content.replace(/import\s+\{([^}]*)Link([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import Link from 'next/link';");
    content = content.replace(/<Link\s+to=/g, "<Link href=");
    
    // Remove empty or leftover react-router-dom imports
    content = content.replace(/import\s+\{\s*\}\s+from\s+['"]react-router-dom['"];?\n?/g, '');
    content = content.replace(/import\s+['"]react-router-dom['"];?\n?/g, '');
    
    fs.writeFileSync(filePath, content);
  }
});
