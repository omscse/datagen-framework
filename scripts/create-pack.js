#!/usr/bin/env node
// Interactive scaffold for creating a new DataGenerationPack.
// Runs directly with Node.js — no compilation required.
// Usage: npm run create-pack

import * as rl from 'node:readline/promises';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { stdin as input, stdout as output, exit } from 'node:process';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPascal(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

async function ask(iface, question, defaultVal) {
  const hint = defaultVal ? ` (default: ${defaultVal})` : '';
  const answer = (await iface.question(`  ${question}${hint}: `)).trim();
  return answer || defaultVal || '';
}

async function fileExists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

/**
 * Returns relative import paths for a pack file located at a given subdir depth.
 * depth=0 → packs/Pack.ts, depth=1 → packs/sub/Pack.ts, etc.
 *
 * src/
 *   framework/core/index.ts
 *   data-generation/
 *     models/<key>.ts
 *     packs/[subdir/]Pack.ts  ← here
 */
function buildImportPaths(key, depth) {
  const up = '../'.repeat(depth + 2);         // up past subdir levels + packs/ + data-generation/
  const upModel = '../'.repeat(depth + 1);    // up past subdir levels + packs/
  return {
    coreImport:  `${up}framework/core/index.js`,
    modelImport: `${upModel}models/${key}.js`,
  };
}

// ── File content generators ───────────────────────────────────────────────────

function genModelFile(modelName, supportsCustom, inputName) {
  let out = `export interface ${modelName} {\n  id: string;\n  // TODO: add fields\n}\n`;
  if (supportsCustom) {
    out += `\nexport interface ${inputName} {\n  // TODO: add input fields\n}\n`;
  }
  return out;
}

function genPackFile({ className, key, modelName, supportsCustom, inputName, description, coreImport, modelImport }) {
  const typeArgs = supportsCustom ? `${modelName}, ${inputName}` : modelName;
  const modelImports = supportsCustom ? `${modelName}, ${inputName}` : modelName;

  let out = `import { Pack, type DataGenerationPack } from '${coreImport}';\n`;
  out += `import type { ${modelImports} } from '${modelImport}';\n\n`;
  out += `@Pack({ name: '${key}', description: '${description}' })\n`;
  out += `export class ${className} implements DataGenerationPack<${typeArgs}> {\n`;
  out += `  async createDefault(): Promise<${modelName}> {\n`;
  out += `    // TODO: return generated ${key} data\n`;
  out += `    return { id: '${key}-1' };\n`;
  out += `  }\n`;
  if (supportsCustom) {
    out += `\n  async createCustom(input: ${inputName}): Promise<${modelName}> {\n`;
    out += `    // TODO: return custom ${key} data based on input\n`;
    out += `    void input;\n`;
    out += `    return { id: '${key}-custom' };\n`;
    out += `  }\n`;
  }
  out += `\n  async delete(_data: ${modelName}): Promise<void> {\n`;
  out += `    // TODO: implement cleanup if needed\n`;
  out += `  }\n`;
  out += `}\n`;
  return out;
}

// ── Registry updaters ─────────────────────────────────────────────────────────

/**
 * Inserts a new import line alphabetically by class name among existing imports.
 */
function insertImport(content, className, importPath) {
  const newLine = `import { ${className} } from '${importPath}';`;
  const lines = content.split('\n');

  // Collect indices of all `import { ... }` lines
  const importIndices = lines.reduce((acc, l, i) => {
    if (/^import \{/.test(l)) acc.push(i);
    return acc;
  }, []);

  if (!importIndices.length) {
    lines.unshift(newLine);
    return lines.join('\n');
  }

  // Find the alphabetical insertion point
  let insertAt = importIndices[importIndices.length - 1] + 1; // default: after last import
  for (const idx of importIndices) {
    const m = /^import \{ (\w+) \}/.exec(lines[idx]);
    if (m && m[1].localeCompare(className) > 0) {
      insertAt = idx;
      break;
    }
  }

  lines.splice(insertAt, 0, newLine);
  return lines.join('\n');
}

/**
 * Appends a new `key: ClassName,` entry at the end of definePackRegistry({ ... }).
 */
function insertRegistryEntry(content, key, className) {
  const entryLine = `  ${key}: ${className},`;
  // Replace the closing `});` with the new entry + `});`
  return content.replace(/^(\s*)\}\);/m, `${entryLine}\n$1});`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

const SRC = path.resolve('src/data-generation');

async function main() {
  const iface = rl.createInterface({ input, output });

  console.log('\n┌─ Create Data Pack ────────────────────────────┐\n');

  // ── Collect inputs ──────────────────────────────────────────────────────────

  const key = await ask(iface, 'Pack key (registry key, e.g. "payment")', '');
  if (!key) { iface.close(); console.error('\nError: Pack key is required.'); exit(1); }
  if (!/^[a-z][a-z0-9-_]*$/.test(key)) {
    iface.close();
    console.error('\nError: Pack key must start with a lowercase letter and use only a-z 0-9 - _');
    exit(1);
  }

  const defaultClass = toPascal(key) + 'Pack';
  const className = await ask(iface, 'Pack class name', defaultClass);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(className)) {
    iface.close();
    console.error('\nError: Class name must be PascalCase with no spaces.');
    exit(1);
  }

  const description = await ask(iface, 'Description', `Generates ${key} test data`);

  const subdirRaw = await ask(iface, 'Subdirectory within packs/ (blank for root)', '');
  const subdir = subdirRaw.replace(/\\/g, '/').replace(/^\/|\/$/g, '');
  if (subdir && !/^[a-z][a-z0-9-_/]*$/.test(subdir)) {
    iface.close();
    console.error('\nError: Subdirectory must be lowercase, e.g. "ecommerce".');
    exit(1);
  }

  const customAnswer = (await ask(iface, 'Supports custom generation? (y/N)', 'N')).toLowerCase();
  const supportsCustom = customAnswer === 'y' || customAnswer === 'yes';

  const modelName = toPascal(key);
  const inputName = supportsCustom
    ? await ask(iface, 'Input type name', `${modelName}Input`)
    : '';

  iface.close();
  console.log('\n└───────────────────────────────────────────────┘\n');

  // ── Resolve file paths ──────────────────────────────────────────────────────

  const modelFile    = path.join(SRC, 'models', `${key}.ts`);
  const packDir      = subdir ? path.join(SRC, 'packs', subdir) : path.join(SRC, 'packs');
  const packFile     = path.join(packDir, `${className}.ts`);
  const modelsIndex  = path.join(SRC, 'models', 'index.ts');
  const packsIndex   = path.join(SRC, 'packs', 'index.ts');
  const registryFile = path.join(SRC, 'registry', 'packRegistry.ts');

  const subdirDepth  = subdir ? subdir.split('/').length : 0;
  const { coreImport, modelImport } = buildImportPaths(key, subdirDepth);

  // ── Conflict checks ─────────────────────────────────────────────────────────

  if (await fileExists(modelFile)) {
    console.error(`Error: model file already exists — ${path.relative('', modelFile)}`);
    exit(1);
  }
  if (await fileExists(packFile)) {
    console.error(`Error: pack file already exists — ${path.relative('', packFile)}`);
    exit(1);
  }

  const registryContent = await fs.readFile(registryFile, 'utf8');
  if (new RegExp(`\\b${key}\\s*:`).test(registryContent)) {
    console.error(`Error: registry key "${key}" already exists in packRegistry.ts`);
    exit(1);
  }

  // ── Write generated files ───────────────────────────────────────────────────

  await fs.mkdir(packDir, { recursive: true });

  await fs.writeFile(modelFile, genModelFile(modelName, supportsCustom, inputName));
  console.log(`✔  Created  src/data-generation/models/${key}.ts`);

  await fs.writeFile(packFile, genPackFile({
    className, key, modelName, supportsCustom, inputName, description, coreImport, modelImport,
  }));
  const packDisplay = path.relative(path.resolve('.'), packFile).replace(/\\/g, '/');
  console.log(`✔  Created  ${packDisplay}`);

  // ── Update barrels ──────────────────────────────────────────────────────────

  const modelsContent = await fs.readFile(modelsIndex, 'utf8');
  await fs.writeFile(modelsIndex, modelsContent.trimEnd() + `\nexport * from './${key}.js';\n`);
  console.log(`✔  Updated  src/data-generation/models/index.ts`);

  const packExport = subdir ? `./${subdir}/${className}.js` : `./${className}.js`;
  const packsContent = await fs.readFile(packsIndex, 'utf8');
  await fs.writeFile(packsIndex, packsContent.trimEnd() + `\nexport * from '${packExport}';\n`);
  console.log(`✔  Updated  src/data-generation/packs/index.ts`);

  // ── Update registry ─────────────────────────────────────────────────────────

  const packImportPath = subdir
    ? `../packs/${subdir}/${className}.js`
    : `../packs/${className}.js`;

  let updated = insertImport(registryContent, className, packImportPath);
  updated = insertRegistryEntry(updated, key, className);
  await fs.writeFile(registryFile, updated);
  console.log(`✔  Updated  src/data-generation/registry/packRegistry.ts`);

  console.log(`\nDone! Run "npm run build" to verify.\n`);
}

main().catch((e) => { console.error('\n' + e.message); exit(1); });
