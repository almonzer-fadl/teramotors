/**
 * Migration Script: Add Unique Codes to Parts, Services, and Inspection Items
 *
 * This script adds uniqueCode fields to existing records in the database.
 * Format: Letter (category) + 3-digit number (000-999)
 * Example: E015 (Engine), B023 (Brakes), T007 (Tires)
 *
 * Usage:
 *   node server/migrations/001-add-unique-codes.js
 *
 * Environment variables required:
 *   MONGODB_URI - MongoDB connection string
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Category prefix mapping
const CATEGORY_PREFIXES = {
  'Engine': 'E',
  'Brakes': 'B',
  'Tires': 'T',
  'Suspension': 'S',
  'Electrical': 'L',
  'Transmission': 'R',
  'Cooling': 'C',
  'Fuel': 'F',
  'Exhaust': 'X',
  'Body': 'D',
  'Interior': 'I',
  'Safety': 'A',
  'General': 'G',
  'Maintenance': 'M',
  'Steering': 'H',
  'HVAC': 'V',
  'Lighting': 'N',
  'Wipers': 'W',
};

// Get prefix for category (with fallback)
function getCategoryPrefix(category) {
  if (!category) return 'G';
  const normalized = category.trim();
  const titleCase = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  return CATEGORY_PREFIXES[titleCase] || 'G';
}

// Generate unique code
function generateUniqueCode(prefix, index) {
  return `${prefix}${index.toString().padStart(3, '0')}`;
}

// Migration statistics
const stats = {
  parts: { total: 0, migrated: 0, skipped: 0, failed: 0 },
  services: { total: 0, migrated: 0, skipped: 0, failed: 0 },
  inspectionTemplates: { total: 0, migrated: 0, skipped: 0, failed: 0 },
  inspections: { total: 0, migrated: 0, skipped: 0, failed: 0 },
};

// CSV report data
const reportData = [];

/**
 * Migrate Parts
 */
async function migrateParts() {
  console.log('\n=== Migrating Parts ===');

  const Part = mongoose.model('Part');
  const parts = await Part.find({}).sort({ category: 1, createdAt: 1 });

  stats.parts.total = parts.length;
  console.log(`Found ${parts.length} parts`);

  // Group by category
  const partsByCategory = {};
  parts.forEach(part => {
    const category = part.category || 'General';
    if (!partsByCategory[category]) {
      partsByCategory[category] = [];
    }
    partsByCategory[category].push(part);
  });

  // Process each category
  for (const [category, categoryParts] of Object.entries(partsByCategory)) {
    const prefix = getCategoryPrefix(category);
    console.log(`\nProcessing category: ${category} (${prefix}) - ${categoryParts.length} parts`);

    for (let i = 0; i < categoryParts.length; i++) {
      const part = categoryParts[i];

      try {
        // Skip if already has uniqueCode
        if (part.uniqueCode) {
          stats.parts.skipped++;
          console.log(`  ✓ Skipped ${part.name} (already has code: ${part.uniqueCode})`);
          continue;
        }

        // Generate unique code
        const uniqueCode = generateUniqueCode(prefix, i);

        // Check if code already exists
        const existing = await Part.findOne({ uniqueCode });
        if (existing) {
          // Handle collision: add suffix
          let suffix = 1;
          let newCode = `${uniqueCode}-${suffix}`;
          while (await Part.findOne({ uniqueCode: newCode })) {
            suffix++;
            newCode = `${uniqueCode}-${suffix}`;
          }
          part.uniqueCode = newCode;
          console.log(`  ⚠ Collision detected, using code: ${newCode}`);
        } else {
          part.uniqueCode = uniqueCode;
        }

        // Save part
        await part.save();
        stats.parts.migrated++;

        // Add to report
        reportData.push({
          entityType: 'Part',
          id: part._id,
          name: part.name,
          category: category,
          prefix: prefix,
          uniqueCode: part.uniqueCode,
          status: 'Success'
        });

        console.log(`  ✓ ${part.name} => ${part.uniqueCode}`);

      } catch (error) {
        stats.parts.failed++;
        console.error(`  ✗ Failed to migrate ${part.name}:`, error.message);

        reportData.push({
          entityType: 'Part',
          id: part._id,
          name: part.name,
          category: category,
          prefix: prefix,
          uniqueCode: 'FAILED',
          status: `Error: ${error.message}`
        });
      }
    }
  }

  console.log(`\nParts migration complete:`);
  console.log(`  Migrated: ${stats.parts.migrated}`);
  console.log(`  Skipped: ${stats.parts.skipped}`);
  console.log(`  Failed: ${stats.parts.failed}`);
}

/**
 * Migrate Services
 */
async function migrateServices() {
  console.log('\n=== Migrating Services ===');

  const Service = mongoose.model('Service');
  const services = await Service.find({}).sort({ category: 1, createdAt: 1 });

  stats.services.total = services.length;
  console.log(`Found ${services.length} services`);

  // Group by category
  const servicesByCategory = {};
  services.forEach(service => {
    const category = service.category || 'General';
    if (!servicesByCategory[category]) {
      servicesByCategory[category] = [];
    }
    servicesByCategory[category].push(service);
  });

  // Process each category
  for (const [category, categoryServices] of Object.entries(servicesByCategory)) {
    const prefix = getCategoryPrefix(category);
    console.log(`\nProcessing category: ${category} (${prefix}) - ${categoryServices.length} services`);

    for (let i = 0; i < categoryServices.length; i++) {
      const service = categoryServices[i];

      try {
        // Skip if already has uniqueCode
        if (service.uniqueCode) {
          stats.services.skipped++;
          console.log(`  ✓ Skipped ${service.name} (already has code: ${service.uniqueCode})`);
          continue;
        }

        // Generate unique code
        const uniqueCode = generateUniqueCode(prefix, i);

        // Check if code already exists
        const existing = await Service.findOne({ uniqueCode });
        if (existing) {
          // Handle collision
          let suffix = 1;
          let newCode = `${uniqueCode}-${suffix}`;
          while (await Service.findOne({ uniqueCode: newCode })) {
            suffix++;
            newCode = `${uniqueCode}-${suffix}`;
          }
          service.uniqueCode = newCode;
          console.log(`  ⚠ Collision detected, using code: ${newCode}`);
        } else {
          service.uniqueCode = uniqueCode;
        }

        // Save service
        await service.save();
        stats.services.migrated++;

        // Add to report
        reportData.push({
          entityType: 'Service',
          id: service._id,
          name: service.name,
          category: category,
          prefix: prefix,
          uniqueCode: service.uniqueCode,
          status: 'Success'
        });

        console.log(`  ✓ ${service.name} => ${service.uniqueCode}`);

      } catch (error) {
        stats.services.failed++;
        console.error(`  ✗ Failed to migrate ${service.name}:`, error.message);

        reportData.push({
          entityType: 'Service',
          id: service._id,
          name: service.name,
          category: category,
          prefix: prefix,
          uniqueCode: 'FAILED',
          status: `Error: ${error.message}`
        });
      }
    }
  }

  console.log(`\nServices migration complete:`);
  console.log(`  Migrated: ${stats.services.migrated}`);
  console.log(`  Skipped: ${stats.services.skipped}`);
  console.log(`  Failed: ${stats.services.failed}`);
}

/**
 * Migrate Inspection Templates
 */
async function migrateInspectionTemplates() {
  console.log('\n=== Migrating Inspection Templates ===');

  const InspectionTemplate = mongoose.model('InspectionTemplate');
  const templates = await InspectionTemplate.find({});

  stats.inspectionTemplates.total = templates.length;
  console.log(`Found ${templates.length} templates`);

  for (const template of templates) {
    try {
      let modified = false;

      // Group items by category
      const itemsByCategory = {};
      template.items.forEach(item => {
        const category = item.category || 'General';
        if (!itemsByCategory[category]) {
          itemsByCategory[category] = [];
        }
        itemsByCategory[category].push(item);
      });

      // Assign codes to items
      const updatedItems = [];
      for (const [category, items] of Object.entries(itemsByCategory)) {
        const prefix = getCategoryPrefix(category);

        items.forEach((item, index) => {
          if (!item.uniqueCode) {
            item.uniqueCode = generateUniqueCode(prefix, index);
            modified = true;
          }
          if (!item.name) {
            item.name = item.itemId; // Use itemId as name if missing
            modified = true;
          }
          updatedItems.push(item);
        });
      }

      if (modified) {
        template.items = updatedItems;
        await template.save();
        stats.inspectionTemplates.migrated++;
        console.log(`  ✓ Updated template: ${template.name}`);

        reportData.push({
          entityType: 'InspectionTemplate',
          id: template._id,
          name: template.name,
          category: template.category,
          prefix: 'N/A',
          uniqueCode: `${template.items.length} items updated`,
          status: 'Success'
        });
      } else {
        stats.inspectionTemplates.skipped++;
        console.log(`  ✓ Skipped template: ${template.name} (already migrated)`);
      }

    } catch (error) {
      stats.inspectionTemplates.failed++;
      console.error(`  ✗ Failed to migrate template ${template.name}:`, error.message);

      reportData.push({
        entityType: 'InspectionTemplate',
        id: template._id,
        name: template.name,
        category: template.category || 'N/A',
        prefix: 'N/A',
        uniqueCode: 'FAILED',
        status: `Error: ${error.message}`
      });
    }
  }

  console.log(`\nInspection Templates migration complete:`);
  console.log(`  Migrated: ${stats.inspectionTemplates.migrated}`);
  console.log(`  Skipped: ${stats.inspectionTemplates.skipped}`);
  console.log(`  Failed: ${stats.inspectionTemplates.failed}`);
}

/**
 * Migrate Vehicle Inspections
 */
async function migrateVehicleInspections() {
  console.log('\n=== Migrating Vehicle Inspections ===');

  const VehicleInspection = mongoose.model('VehicleInspection');
  const inspections = await VehicleInspection.find({});

  stats.inspections.total = inspections.length;
  console.log(`Found ${inspections.length} inspections`);

  for (const inspection of inspections) {
    try {
      let modified = false;

      // Update items
      inspection.items = inspection.items.map(item => {
        if (!item.uniqueCode) {
          const prefix = getCategoryPrefix(item.category);
          item.uniqueCode = generateUniqueCode(prefix, 0); // Will be updated based on matching
          modified = true;
        }
        if (!item.name) {
          item.name = item.itemId;
          modified = true;
        }
        return item;
      });

      if (modified) {
        await inspection.save();
        stats.inspections.migrated++;
        console.log(`  ✓ Updated inspection: ${inspection._id}`);
      } else {
        stats.inspections.skipped++;
      }

    } catch (error) {
      stats.inspections.failed++;
      console.error(`  ✗ Failed to migrate inspection ${inspection._id}:`, error.message);
    }
  }

  console.log(`\nVehicle Inspections migration complete:`);
  console.log(`  Migrated: ${stats.inspections.migrated}`);
  console.log(`  Skipped: ${stats.inspections.skipped}`);
  console.log(`  Failed: ${stats.inspections.failed}`);
}

/**
 * Generate CSV report
 */
function generateReport() {
  console.log('\n=== Generating Migration Report ===');

  const timestamp = new Date().toISOString().split('T')[0];
  const reportPath = path.join(__dirname, `migration-report-${timestamp}.csv`);

  const csvHeader = 'Entity Type,ID,Name,Category,Prefix,Unique Code,Status\n';
  const csvRows = reportData.map(row =>
    `${row.entityType},${row.id},${row.name},${row.category},${row.prefix},${row.uniqueCode},${row.status}`
  ).join('\n');

  fs.writeFileSync(reportPath, csvHeader + csvRows);

  console.log(`Report saved to: ${reportPath}`);
}

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('===========================================');
    console.log('  UNIQUE CODE MIGRATION SCRIPT');
    console.log('===========================================');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';
    console.log(`\nConnecting to MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Run migrations
    await migrateParts();
    await migrateServices();
    await migrateInspectionTemplates();
    await migrateVehicleInspections();

    // Generate report
    generateReport();

    // Print summary
    console.log('\n===========================================');
    console.log('  MIGRATION SUMMARY');
    console.log('===========================================');
    console.log(`Parts:         ${stats.parts.migrated}/${stats.parts.total} migrated (${stats.parts.skipped} skipped, ${stats.parts.failed} failed)`);
    console.log(`Services:      ${stats.services.migrated}/${stats.services.total} migrated (${stats.services.skipped} skipped, ${stats.services.failed} failed)`);
    console.log(`Templates:     ${stats.inspectionTemplates.migrated}/${stats.inspectionTemplates.total} migrated (${stats.inspectionTemplates.skipped} skipped, ${stats.inspectionTemplates.failed} failed)`);
    console.log(`Inspections:   ${stats.inspections.migrated}/${stats.inspections.total} migrated (${stats.inspections.skipped} skipped, ${stats.inspections.failed} failed)`);
    console.log('===========================================\n');

    const totalFailed = stats.parts.failed + stats.services.failed + stats.inspectionTemplates.failed + stats.inspections.failed;
    if (totalFailed > 0) {
      console.log(`⚠  WARNING: ${totalFailed} items failed to migrate. Check the report for details.`);
      process.exit(1);
    } else {
      console.log('✓ Migration completed successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run migration
runMigration();
