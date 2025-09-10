const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix relative imports that don't end with .js
  content = content.replace(
    /from\s+['"](\.[^'"]*?)(?<!\.js)(['"])/g,
    (match, importPath, quote) => {
      // Skip if it already ends with .js
      if (importPath.endsWith('.js')) {
        return match;
      }
      modified = true;
      console.log(`Fixed import in ${filePath}: ${importPath} -> ${importPath}.js`);
      return `from ${quote}${importPath}.js${quote}`;
    }
  );

  // Fix import statements that don't end with .js
  content = content.replace(
    /import\s+([^'"]*?)\s+from\s+['"](\.[^'"]*?)(?<!\.js)(['"])/g,
    (match, importedItems, importPath, quote) => {
      if (importPath.endsWith('.js')) {
        return match;
      }
      modified = true;
      console.log(`Fixed import in ${filePath}: ${importPath} -> ${importPath}.js`);
      return `import ${importedItems} from ${quote}${importPath}.js${quote}`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed imports in: ${filePath}`);
  }

  return modified;
}

function fixImportsInDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalFixed = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      totalFixed += fixImportsInDirectory(fullPath);
    } else if (file.name.endsWith('.js')) {
      if (fixImportsInFile(fullPath)) {
        totalFixed++;
      }
    }
  }

  return totalFixed;
}

console.log('🔧 Fixing ESM imports...');
const esmDir = './dist/esm';

if (!fs.existsSync(esmDir)) {
  console.error('❌ ESM directory not found:', esmDir);
  process.exit(1);
}

const fixedCount = fixImportsInDirectory(esmDir);
console.log(`\n✅ Fixed imports in ${fixedCount} files`);

if (fixedCount > 0) {
  console.log('\n🎉 All ESM imports have been fixed!');
} else {
  console.log('\n✨ No imports needed fixing.');
}
