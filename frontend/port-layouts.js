const fs = require('fs');
const path = require('path');

const srcDir = 'A:\\FBP_frontend\\src\\layouts';
const destDir = 'a:\\FBP\\frontend\\src\\app';

function processLayout(content) {
  let newContent = '"use client";\n' + content;
  
  // Imports
  newContent = newContent.replace(/import\s+\{([^}]*)useLocation([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import { usePathname } from 'next/navigation';");
  newContent = newContent.replace(/import\s+\{([^}]*)Link([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import Link from 'next/link';");
  newContent = newContent.replace(/import\s+\{([^}]*)Outlet([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "");
  newContent = newContent.replace(/import\s+\{.*\}\s+from\s+['"]react-router-dom['"];?/g, "");
  
  // Props
  newContent = newContent.replace(/export\s+const\s+([A-Za-z0-9_]+)\s*:\s*React\.FC\s*=\s*\(\)\s*=>/g, "export default function $1({ children }: { children: React.ReactNode })");
  newContent = newContent.replace(/export\s+const\s+([A-Za-z0-9_]+)\s*=\s*\([^)]*\)\s*=>/g, "export default function $1({ children }: { children: React.ReactNode })");
  
  // Hooks
  newContent = newContent.replace(/const\s+location\s*=\s*useLocation\(\);?/g, "const pathname = usePathname();\n  const location = { pathname };");
  
  // Elements
  newContent = newContent.replace(/<Outlet\s*\/>/g, "{children}");
  newContent = newContent.replace(/<Link\s+to=/g, "<Link href=");
  
  return newContent;
}

const layouts = {
  'DashboardLayout.tsx': '(dashboard)/layout.tsx',
  'MarketingLayout.tsx': '(marketing)/layout.tsx',
};

for (const [file, route] of Object.entries(layouts)) {
  const sourcePath = path.join(srcDir, file);
  if (fs.existsSync(sourcePath)) {
    const destPath = path.join(destDir, route);
    const destFolder = path.dirname(destPath);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    const content = fs.readFileSync(sourcePath, 'utf8');
    const processed = processLayout(content);
    fs.writeFileSync(destPath, processed);
    console.log(`Ported layout ${file} to ${route}`);
  }
}
