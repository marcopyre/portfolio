#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.md']);

async function* walk(dir) {
  for (const dirent of await fs.readdir(dir, { withFileTypes: true })) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name === 'node_modules' || dirent.name === '.next' || dirent.name === '.git') continue;
      yield* walk(res);
    } else {
      yield res;
    }
  }
}

function stripComments(content, ext) {
  if (ext === '.md') {
    
    return content.replace(/<!--([\s\S]*?)-->/g, '').trim();
  }
  if (ext === '.css') {
    
    return content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  }
  
  
  const withoutBlock = content.replace(/\/\*[\s\S]*?\*\//g, '');
  const withoutLine = withoutBlock.replace(/(^|\s)\/\/.*$/gm, '$1');
  return withoutLine.trim();
}

async function main() {
  const root = process.cwd();
  let changed = 0;
  for await (const file of walk(root)) {
    const ext = path.extname(file).toLowerCase();
    if (!exts.has(ext)) continue;
    const rel = path.relative(root, file);
    if (rel.startsWith('node_modules') || rel.startsWith('.next') || rel.startsWith('.git')) continue;
    try {
      const before = await fs.readFile(file, 'utf8');
      const after = stripComments(before, ext);
      if (after !== before) {
        await fs.writeFile(file, after, 'utf8');
        changed++;
      }
    } catch {}
  }
  console.log(`Comments stripped from ${changed} files.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});