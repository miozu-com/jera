#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Find the components directory relative to the package
function findComponentsDir() {
  // Try to locate the components directory
  const possiblePaths = [
    // When running from the installed package
    path.join(__dirname, 'src', 'components'),
    // When running from the project root
    path.join(__dirname, 'components'),
    // When running from a cloned repo
    path.join(__dirname, '..', 'src', 'components')
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  // If components directory not found, return null
  return null;
}

const COMPONENTS_DIR = findComponentsDir();

// List available components in the components directory
function listAvailableComponents() {
  if (!COMPONENTS_DIR) {
    return [];
  }

  try {
    return fs.readdirSync(COMPONENTS_DIR)
      .filter(file => file.endsWith('.svelte'))
      .map(file => file.replace('.svelte', ''));
  } catch (error) {
    console.error('Error reading components directory:', error);
    return [];
  }
}

const program = new Command();

program
  .name('jera')
  .description('Install Jera components to your project')
  .version('0.0.1');

program
  .command('list')
  .description('List all available components')
  .action(() => {
    const components = listAvailableComponents();

    if (components.length === 0) {
      console.log('No components found.');
      return;
    }

    console.log('Available components:');
    components.forEach(comp => console.log(`- ${comp}`));
  });

program
  .command('add')
  .description('Add a component to your project')
  .argument('<component>', 'Component to add (e.g. Input)')
  .option('-d, --dir <directory>', 'Target directory', 'src/lib/components')
  .action((component, options) => {
    console.log(`Adding ${component} to ${options.dir}...`);

    const componentFile = component.endsWith('.svelte')
      ? component
      : `${component}.svelte`;

    // Check if components directory exists
    if (!COMPONENTS_DIR) {
      console.error('Error: Components directory not found.');
      console.error('This could happen if you\'re running the CLI in development mode');
      console.error('or if the package structure has changed.');
      return;
    }

    // Check if component exists
    const sourceComponentPath = path.join(COMPONENTS_DIR, componentFile);
    if (!fs.existsSync(sourceComponentPath)) {
      console.error(`Error: Component "${component}" not found.`);
      console.error('Available components:');
      listAvailableComponents().forEach(comp => console.error(`- ${comp}`));
      return;
    }

    // Create target directory if it doesn't exist
    const targetDir = path.resolve(options.dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Copy the component file
    const componentContent = fs.readFileSync(sourceComponentPath, 'utf-8');
    fs.writeFileSync(path.join(targetDir, componentFile), componentContent);

    console.log(`Component ${component} added to ${options.dir}`);
    console.log('\nUsage:');
    console.log('\nNOTE: This component uses the Miozu theme.');
    console.log('Make sure you have installed @miozu/js-theme and configured it in your Tailwind config.');
  });

// Add init command to set up the repository structure
program
  .command('init')
  .description('Initialize a new project with Jera components')
  .action(() => {
    console.log('Initializing Jera components...');

    const componentsDir = path.resolve('src/lib/components');

    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir, { recursive: true });
    }

    console.log('Project initialized! You can now add components with:');
    console.log('  jera add <component>');
  });

program.parse();
