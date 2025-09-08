#!/usr/bin/env node

// Quick development tools for the EV Charging Station project

const { execSync } = require('child_process');

const commands = {
  'check-deps': () => {
    console.log('🔍 Checking dependencies...');
    execSync('npm ls --depth=0', { stdio: 'inherit' });
  },
  
  'type-check': () => {
    console.log('🔍 Running TypeScript check...');
    execSync('npx tsc --noEmit', { stdio: 'inherit' });
  },
  
  'lint-fix': () => {
    console.log('🔧 Running linter with auto-fix...');
    execSync('npm run lint -- --fix', { stdio: 'inherit' });
  },
  
  'clean-install': () => {
    console.log('🧹 Clean install...');
    execSync('rm -rf node_modules package-lock.json', { stdio: 'inherit' });
    execSync('npm install', { stdio: 'inherit' });
  },
  
  'dev-fresh': () => {
    console.log('🚀 Starting fresh development server...');
    execSync('npm run dev', { stdio: 'inherit' });
  }
};

const command = process.argv[2];
if (commands[command]) {
  commands[command]();
} else {
  console.log('Available commands:');
  Object.keys(commands).forEach(cmd => console.log(`  node scripts/dev-tools.js ${cmd}`));
}
