import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function findFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Ignore patterns
    if (fullPath.includes(path.join('src', 'components', 'ui')) || 
        fullPath.includes(path.join('src', 'i18n')) || 
        fullPath.endsWith('.test.tsx')) {
      continue;
    }
    
    if (entry.isDirectory()) {
      findFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function run() {
  console.log("Finding TypeScript files...");
  
  const files = findFiles('src');

  if (files.length === 0) {
    console.log("No files found!");
    return;
  }

  console.log(`Found ${files.length} files. Running codemod...`);

  try {
    const CHUNK_SIZE = 50;
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      const chunk = files.slice(i, i + CHUNK_SIZE);
      console.log(`Processing chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(files.length / CHUNK_SIZE)}...`);
      const filesArg = chunk.map(f => `"${f}"`).join(' ');
      const command = `pnpx jscodeshift -t scripts/i18n-codemod.cjs --parser=tsx ${filesArg}`;
      execSync(command, { stdio: 'inherit' });
    }
    console.log("Codemod completed successfully!");
  } catch (err) {
    console.error("Error running jscodeshift:", err.message);
  }
}

run();
