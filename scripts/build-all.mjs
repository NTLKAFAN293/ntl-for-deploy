#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting full build process...');

// Clean dist directory
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

try {
  // Build client
  console.log('📦 Building client...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  // Move client files to correct location
  const clientSource = 'client/dist/public';
  const clientDest = 'dist/public';
  
  if (fs.existsSync(clientSource)) {
    console.log('📁 Moving client files...');
    if (fs.existsSync(clientDest)) {
      fs.rmSync(clientDest, { recursive: true, force: true });
    }
    fs.cpSync(clientSource, clientDest, { recursive: true });
    console.log('✅ Client files moved successfully');
  }

  // Build server
  console.log('⚙️ Building server...');
  execSync('node scripts/build-server.mjs', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}