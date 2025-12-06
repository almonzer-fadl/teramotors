#!/usr/bin/env node

/**
 * Database Cleanup Script for TeraMotors (MongoDB Direct)
 * 
 * This script connects directly to MongoDB and deletes all data except users.
 * It handles foreign key relationships by deleting in the correct order.
 * 
 * WARNING: This will permanently delete all data except users!
 * Make sure to backup your database before running this script.
 * 
 * Usage:
 *   node cleanup-database-mongo.js [--dry-run] [--confirm] [--uri MONGODB_URI]
 * 
 * Options:
 *   --dry-run    Show what would be deleted without actually deleting
 *   --confirm    Skip confirmation prompt (use with caution)
 *   --uri        MongoDB connection URI (default: from MONGODB_URI env var)
 */

const { MongoClient } = require('mongodb');

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipConfirmation = args.includes('--confirm');
const uriArg = args.find(arg => arg.startsWith('--uri='));
const mongoUri = uriArg ? uriArg.split('=')[1] : process.env.MONGODB_URI;

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

// Database connection
let client;
let db;

async function connectToDatabase() {
  try {
    if (!mongoUri) {
      throw new Error('MongoDB URI is not provided. Use --uri= or set MONGODB_URI environment variable.');
    }

    client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
    });

    await client.connect();
    db = client.db('teramotors');
    log('✓ Connected to MongoDB successfully', 'green');
  } catch (error) {
    log(`✗ Failed to connect to database: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Get counts for all collections
async function getCollectionCounts() {
  const counts = {};
  
  try {
    const collections = [
      'customers', 'vehicles', 'appointments', 'jobcards', 'invoices', 
      'estimates', 'payments', 'vehicleinspections', 'parts', 'services', 
      'mechanics', 'inspectiontemplates', 'users'
    ];

    for (const collectionName of collections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        counts[collectionName] = count;
      } catch (error) {
        // Collection might not exist
        counts[collectionName] = 0;
      }
    }
    
    return counts;
  } catch (error) {
    log(`✗ Error getting collection counts: ${error.message}`, 'red');
    throw error;
  }
}

// Delete operations in correct order to handle foreign key relationships
async function deleteAllData() {
  const results = {};
  
  try {
    // Collections to delete in order (respecting foreign key relationships)
    const collectionsToDelete = [
      'payments',           // References invoices
      'invoices',           // References job cards, customers, vehicles
      'estimates',          // References job cards, customers, vehicles
      'jobcards',           // References appointments, inspections, customers, vehicles
      'appointments',       // References customers, vehicles, services
      'vehicleinspections', // References vehicles, customers
      'vehicles',           // References customers
      'customers',          // Main entity
      'mechanics',          // References users (but we keep users)
      'parts',              // Inventory
      'services',           // Services
      'inspectiontemplates' // Templates
    ];

    for (const collectionName of collectionsToDelete) {
      logSection(`Deleting ${collectionName}`);
      
      if (isDryRun) {
        try {
          results[collectionName] = await db.collection(collectionName).countDocuments();
        } catch (error) {
          results[collectionName] = 0;
        }
      } else {
        try {
          const result = await db.collection(collectionName).deleteMany({});
          results[collectionName] = result.deletedCount;
        } catch (error) {
          log(`⚠️  Error deleting ${collectionName}: ${error.message}`, 'yellow');
          results[collectionName] = 0;
        }
      }
      
      logResult(collectionName, results[collectionName]);
    }

    return results;
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
    log('🚀 TeraMotors Database Cleanup Script (MongoDB Direct)', 'bright');
    log('=====================================================', 'bright');
    
    if (isDryRun) {
      log('🔍 DRY RUN MODE - No data will be deleted', 'yellow');
    }

    // Connect to database
    await connectToDatabase();

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
  } finally {
    // Close database connection
    if (client) {
      await client.close();
      log('\n🔌 Database connection closed', 'blue');
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n\n⚠️  Script interrupted by user', 'yellow');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n\n⚠️  Script terminated', 'yellow');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, deleteAllData, getCollectionCounts };
