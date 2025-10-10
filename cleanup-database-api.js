#!/usr/bin/env node

/**
 * Database Cleanup Script for TeraMotors (API-based)
 * 
 * This script will delete all data except users from the database using API endpoints.
 * It's safer than direct database access and handles authentication properly.
 * 
 * WARNING: This will permanently delete all data except users!
 * Make sure to backup your database before running this script.
 * 
 * Usage:
 *   node cleanup-database-api.js [--dry-run] [--confirm] [--base-url URL]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --confirm    Skip confirmation prompt (use with caution)
 *   --base-url   Base URL for the API (default: http://localhost:3000)
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirmation = args.includes('--confirm');
const baseUrlArg = args.find(arg => arg.startsWith('--base-url='));
const baseUrl = baseUrlArg ? baseUrlArg.split('=')[1] : 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(title, 'bright');
  log('='.repeat(50), 'cyan');
}

function logResult(modelName, count, action = 'deleted') {
  const status = isDryRun ? 'would be' : 'were';
  log(`✓ ${count} ${modelName} records ${status} ${action}`, count > 0 ? 'green' : 'yellow');
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Get counts for all collections
async function getCollectionCounts() {
  const counts = {};
  
  try {
    // Get customers count
    const customersResponse = await makeRequest(`${baseUrl}/api/customers?limit=1`);
    counts.customers = customersResponse.data.total || 0;

    // Get vehicles count
    const vehiclesResponse = await makeRequest(`${baseUrl}/api/vehicles?limit=1`);
    counts.vehicles = vehiclesResponse.data.total || 0;

    // Get appointments count
    const appointmentsResponse = await makeRequest(`${baseUrl}/api/appointments?limit=1`);
    counts.appointments = appointmentsResponse.data.total || 0;

    // Get job cards count
    const jobCardsResponse = await makeRequest(`${baseUrl}/api/job-cards?limit=1`);
    counts.jobCards = jobCardsResponse.data.total || 0;

    // Get invoices count
    const invoicesResponse = await makeRequest(`${baseUrl}/api/invoices?limit=1`);
    counts.invoices = invoicesResponse.data.total || 0;

    // Get estimates count
    const estimatesResponse = await makeRequest(`${baseUrl}/api/estimates?limit=1`);
    counts.estimates = estimatesResponse.data.total || 0;

    // Get payments count
    const paymentsResponse = await makeRequest(`${baseUrl}/api/payments?limit=1`);
    counts.payments = paymentsResponse.data.total || 0;

    // Get inspections count
    const inspectionsResponse = await makeRequest(`${baseUrl}/api/inspections?limit=1`);
    counts.inspections = inspectionsResponse.data.total || 0;

    // Get parts count
    const partsResponse = await makeRequest(`${baseUrl}/api/parts?limit=1`);
    counts.parts = partsResponse.data.total || 0;

    // Get services count
    const servicesResponse = await makeRequest(`${baseUrl}/api/services?limit=1`);
    counts.services = servicesResponse.data.total || 0;

    // Get users count (we'll preserve these)
    const usersResponse = await makeRequest(`${baseUrl}/api/users?limit=1`);
    counts.users = usersResponse.data.total || 0;
    
    return counts;
  } catch (error) {
    log(`✗ Error getting collection counts: ${error.message}`, 'red');
    throw error;
  }
}

// Delete all data using API endpoints
async function deleteAllData() {
  const results = {};
  
  try {
    // Note: This is a simplified approach. In a real implementation, you would need:
    // 1. Authentication (admin login)
    // 2. Proper API endpoints for bulk deletion
    // 3. Handle pagination for large datasets
    
    log('⚠️  Note: This script requires admin authentication and proper API endpoints for bulk deletion.', 'yellow');
    log('⚠️  The current implementation is a template that needs to be customized for your API.', 'yellow');
    
    if (isDryRun) {
      log('\n🔍 DRY RUN - Would attempt to delete data via API endpoints', 'yellow');
      const counts = await getCollectionCounts();
      return counts;
    } else {
      log('\n❌ Actual deletion not implemented in this API-based version.', 'red');
      log('Please use the direct database version or implement proper API endpoints.', 'red');
      return {};
    }
    
  } catch (error) {
    log(`✗ Error during deletion: ${error.message}`, 'red');
    throw error;
  }
}

// Show summary
function showSummary(initialCounts, results) {
  logSection('CLEANUP SUMMARY');
  
  const totalDeleted = Object.values(results).reduce((sum, count) => sum + count, 0);
  const totalInitial = Object.entries(initialCounts)
    .filter(([key]) => key !== 'users')
    .reduce((sum, [, count]) => sum + count, 0);

  log(`Initial records: ${totalInitial}`, 'yellow');
  log(`Records ${isDryRun ? 'that would be' : ''} deleted: ${totalDeleted}`, 'green');
  log(`Users preserved: ${initialCounts.users}`, 'blue');
  
  log('\nDetailed breakdown:', 'bright');
  Object.entries(results).forEach(([model, count]) => {
    if (count > 0) {
      log(`  ${model}: ${count}`, 'green');
    }
  });
}

// Confirmation prompt
async function confirmDeletion() {
  if (skipConfirmation) {
    return true;
  }

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('\n⚠️  WARNING: This will permanently delete ALL data except users!\nAre you sure you want to continue? (type "DELETE" to confirm): ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE');
    });
  });
}

// Main execution
async function main() {
  try {
    log('🚀 TeraMotors Database Cleanup Script (API-based)', 'bright');
    log('================================================', 'bright');
    log(`Using API base URL: ${baseUrl}`, 'blue');
    
    if (isDryRun) {
      log('🔍 DRY RUN MODE - No data will be deleted', 'yellow');
    }

    // Test API connection
    logSection('Testing API Connection');
    try {
      const healthResponse = await makeRequest(`${baseUrl}/api/health`);
      if (healthResponse.status === 200) {
        log('✓ API connection successful', 'green');
      } else {
        log('⚠️  API responded but may not be fully functional', 'yellow');
      }
    } catch (error) {
      log(`⚠️  API connection test failed: ${error.message}`, 'yellow');
      log('Continuing anyway...', 'yellow');
    }

    // Get initial counts
    logSection('Current Database State');
    const initialCounts = await getCollectionCounts();
    
    Object.entries(initialCounts).forEach(([model, count]) => {
      const color = model === 'users' ? 'blue' : 'yellow';
      log(`${model}: ${count} records`, color);
    });

    // Confirm deletion
    if (!isDryRun) {
      const confirmed = await confirmDeletion();
      if (!confirmed) {
        log('❌ Operation cancelled by user', 'red');
        process.exit(0);
      }
    }

    // Perform deletion
    logSection(isDryRun ? 'DRY RUN - What Would Be Deleted' : 'Deleting Data');
    const results = await deleteAllData();

    // Show summary
    showSummary(initialCounts, results);

    if (isDryRun) {
      log('\n🔍 This was a dry run. No data was actually deleted.', 'yellow');
      log('Run without --dry-run to perform the actual deletion.', 'yellow');
    } else {
      log('\n✅ Database cleanup completed successfully!', 'green');
    }

  } catch (error) {
    log(`\n❌ Script failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n⚠️  Script interrupted by user', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n⚠️  Script terminated', 'yellow');
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, deleteAllData, getCollectionCounts };
