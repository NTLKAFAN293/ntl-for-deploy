import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildServer() {
  try {
    // إنشاء مجلد dist إذا لم يكن موجوداً
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist', { recursive: true });
    }
    await build({
      entryPoints: [join(__dirname, '../server/index.ts')],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: 'dist/index.js',
      external: [
        'ws', 
        'bufferutil', 
        'utf-8-validate',
        'express',
        'cors',
        'helmet',
        'lightningcss',
        '@babel/preset-typescript',
        'tailwindcss',
        'autoprefixer',
        'postcss'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      minify: false,
      sourcemap: false,
      allowOverwrite: true,
      packages: 'external'
    });

    console.log('✅ Server built successfully');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();