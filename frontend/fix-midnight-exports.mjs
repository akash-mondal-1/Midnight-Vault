import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const midnightDir = path.join(__dirname, 'node_modules', '@midnight-ntwrk');

function fixExports(exportsObj) {
  if (typeof exportsObj !== 'object' || exportsObj === null) return exportsObj;
  
  if (Array.isArray(exportsObj)) {
    return exportsObj.map(fixExports);
  }

  const newObj = {};
  const entries = Object.entries(exportsObj);
  let hasDefault = false;
  let defaultVal = null;
  
  for (const [k, v] of entries) {
    if (k === 'default') {
      hasDefault = true;
      defaultVal = fixExports(v);
    } else {
      newObj[k] = fixExports(v);
    }
  }
  
  if (hasDefault) {
    newObj['default'] = defaultVal;
  }
  
  return newObj;
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name === 'package.json') {
      const content = fs.readFileSync(fullPath, 'utf8');
      try {
        const pkg = JSON.parse(content);
        if (pkg.exports) {
          pkg.exports = fixExports(pkg.exports);
          fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2));
          console.log(`Fixed ${fullPath}`);
        }
      } catch(e) {}
    }
  }
}

processDir(midnightDir);
console.log('Done fixing exports!');
