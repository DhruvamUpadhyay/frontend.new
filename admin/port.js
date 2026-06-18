const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\udhru\\.gemini\\antigravity-ide\\brain\\e63e6d64-2ef3-4c85-a2fe-9056f8c80948\\scratch\\admin-old\\src\\pages\\admin';
const destDir = 'a:\\FBP\\admin\\src\\app';

const routes = {
  'AdminDashboard.tsx': 'page.tsx',
  'AdminLogin.tsx': 'login/page.tsx',
  'LandingPageEditor.tsx': 'landing/page.tsx',
  'ManageCourses.tsx': 'courses/page.tsx',
  'ManageTests.tsx': 'tests/page.tsx',
  'ManageMaterials.tsx': 'materials/page.tsx',
  'ManagePodcasts.tsx': 'podcasts/page.tsx',
  'ManageEvents.tsx': 'events/page.tsx',
  'ThemeSettings.tsx': 'settings/page.tsx',
  'MediaManager.tsx': 'media/page.tsx',
};

function processFile(content) {
  let newContent = '"use client";\n' + content;
  newContent = newContent.replace(/import\s+\{([^}]*)useNavigate([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import { $1$2 } from 'react-router-dom';\nimport { useRouter } from 'next/navigation';");
  newContent = newContent.replace(/import\s+\{\s*\}\s+from\s+['"]react-router-dom['"];?/g, '');
  newContent = newContent.replace(/const\s+navigate\s*=\s*useNavigate\(\);?/g, "const router = useRouter();");
  newContent = newContent.replace(/navigate\(/g, "router.push(");
  newContent = newContent.replace(/import\.meta\.env\.VITE_/g, "process.env.NEXT_PUBLIC_");
  newContent = newContent.replace(/import\.meta\.env\.PROD/g, "(process.env.NODE_ENV === 'production')");
  
  // React Router Dom links to Next Links
  newContent = newContent.replace(/import\s+\{([^}]*)Link([^}]*)\}\s+from\s+['"]react-router-dom['"];?/g, "import { $1$2 } from 'react-router-dom';\nimport Link from 'next/link';");
  newContent = newContent.replace(/<Link\s+to=/g, "<Link href=");

  return newContent;
}

for (const [file, route] of Object.entries(routes)) {
  const sourcePath = path.join(srcDir, file);
  if (fs.existsSync(sourcePath)) {
    const destPath = path.join(destDir, route);
    const destFolder = path.dirname(destPath);
    if (!fs.existsSync(destFolder)) {
      fs.mkdirSync(destFolder, { recursive: true });
    }
    const content = fs.readFileSync(sourcePath, 'utf8');
    const processed = processFile(content);
    fs.writeFileSync(destPath, processed);
    console.log(`Ported ${file} to ${route}`);
  } else {
    console.log(`Source file not found: ${sourcePath}`);
  }
}
