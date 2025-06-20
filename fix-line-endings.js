#!/usr/bin/env node

/**
 * Fix CRLF line endings to LF across the codebase
 * This script will convert all text files to use LF line endings
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const textExtensions = [
  '.js', '.ts', '.tsx', '.jsx', '.astro', '.json', 
  '.md', '.css', '.html', '.yml', '.yaml', '.mjs'
];

const ignorePaths = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.astro'
];

async function shouldProcess(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.'));
  return textExtensions.includes(ext);
}

async function isDirectory(path) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check if file has CRLF line endings
    if (content.includes('\r\n')) {
      // Convert CRLF to LF
      const convertedContent = content.replace(/\r\n/g, '\n');
      await fs.writeFile(filePath, convertedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

async function processDirectory(dirPath) {
  const items = await fs.readdir(dirPath);
  let fixedCount = 0;
  
  for (const item of items) {
    const fullPath = join(dirPath, item);
    
    // Skip ignored directories
    if (ignorePaths.some(ignore => fullPath.includes(ignore))) {
      continue;
    }
    
    if (await isDirectory(fullPath)) {
      fixedCount += await processDirectory(fullPath);
    } else if (await shouldProcess(fullPath)) {
      if (await processFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

async function main() {
  console.log('🔧 Starting line ending conversion (CRLF → LF)...\n');
  
  const startTime = Date.now();
  const fixedCount = await processDirectory('.');
  const endTime = Date.now();
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Files fixed: ${fixedCount}`);
  console.log(`⏱️ Time taken: ${endTime - startTime}ms`);
  
  if (fixedCount > 0) {
    console.log('\n🎉 Line ending conversion completed!');
    console.log('💡 All files now use LF line endings consistently.');
  } else {
    console.log('\n✨ No files needed conversion - all already have LF endings.');
  }
}

main().catch(console.error);