#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Directories to clean
const PRODUCTION_DIRS = ['app', 'components', 'lib', 'zatca', 'config'];

// Exclude patterns
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/scripts/**',
  '**/tests/**',
  '**/docs/**',
  '**/*.test.{ts,tsx,js,jsx}',
  '**/*.spec.{ts,tsx,js,jsx}'
];

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  logsRemoved: 0,
  errorsRemoved: 0,
  warnsRemoved: 0,
  infosRemoved: 0,
  debugsRemoved: 0
};

const removedLogs = [];

/**
 * Remove console statements from code
 */
function removeConsoleStatements(content, filePath) {
  let modified = false;
  let newContent = content;
  const lines = content.split('\n');
  const modifiedLines = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const originalLine = line;

    // Match console.log, console.error, console.warn, console.info, console.debug
    const consolePattern = /console\.(log|error|warn|info|debug)\s*\(/;

    if (consolePattern.test(line)) {
      // Get the type
      const match = line.match(/console\.(log|error|warn|info|debug)/);
      const type = match ? match[1] : 'unknown';

      // Check if it's a multi-line console statement
      let fullStatement = line;
      let lineCount = 1;
      let openParens = (line.match(/\(/g) || []).length;
      let closeParens = (line.match(/\)/g) || []).length;

      // Handle multi-line statements
      while (openParens > closeParens && i + lineCount < lines.length) {
        fullStatement += '\n' + lines[i + lineCount];
        openParens += (lines[i + lineCount].match(/\(/g) || []).length;
        closeParens += (lines[i + lineCount].match(/\)/g) || []).length;
        lineCount++;
      }

      // Record what we're removing
      removedLogs.push({
        file: filePath,
        line: i + 1,
        type: type,
        content: fullStatement.trim().substring(0, 100) + (fullStatement.length > 100 ? '...' : '')
      });

      // Update statistics
      stats[`${type}sRemoved`]++;

      // Remove the statement
      // If the line only contains the console statement, remove the entire line
      if (line.trim().match(/^console\.(log|error|warn|info|debug)\s*\(/)) {
        // Skip this line and any continuation lines
        i += lineCount - 1;
        modified = true;
        continue;
      } else {
        // The console statement is part of a larger expression
        // Just comment it out to be safe
        line = line.replace(consolePattern, '// console.$1(');
        modified = true;
      }
    }

    modifiedLines.push(line);
  }

  if (modified) {
    newContent = modifiedLines.join('\n');
    stats.filesModified++;
  }

  return { content: newContent, modified };
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, modified } = removeConsoleStatements(content, filePath);

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Modified: ${filePath}`);
    }

    stats.filesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🧹 Removing console statements from production code...\n');

  // Build glob patterns for production directories
  const patterns = PRODUCTION_DIRS.map(dir => `${dir}/**/*.{ts,tsx,js,jsx}`);

  // Find all files
  const files = await glob(patterns, {
    ignore: EXCLUDE_PATTERNS,
    cwd: process.cwd()
  });

  console.log(`Found ${files.length} files to process\n`);

  // Process each file
  for (const file of files) {
    await processFile(file);
  }

  // Print summary
  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Files processed:    ${stats.filesProcessed}`);
  console.log(`Files modified:     ${stats.filesModified}`);
  console.log(`console.log:        ${stats.logsRemoved} removed`);
  console.log(`console.error:      ${stats.errorsRemoved} removed`);
  console.log(`console.warn:       ${stats.warnsRemoved} removed`);
  console.log(`console.info:       ${stats.infosRemoved} removed`);
  console.log(`console.debug:      ${stats.debugsRemoved} removed`);
  console.log(`Total removed:      ${stats.logsRemoved + stats.errorsRemoved + stats.warnsRemoved + stats.infosRemoved + stats.debugsRemoved}`);
  console.log('═'.repeat(60));

  // Save detailed log
  const logFile = path.join(process.cwd(), 'console-removal-log.json');
  fs.writeFileSync(logFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    removedLogs
  }, null, 2));

  console.log(`\n📝 Detailed log saved to: console-removal-log.json`);
  console.log('\n✅ Done! Please review changes and run tests before committing.\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
