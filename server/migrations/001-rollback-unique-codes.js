/**
 * Rollback Script: Remove Unique Codes
 *
 * This script removes uniqueCode fields added by the migration.
 * USE WITH CAUTION - This will remove all unique codes!
 *
 * Usage:
 *   node server/migrations/001-rollback-unique-codes.js
 *
 * Environment variables required:
 *   MONGODB_URI - MongoDB connection string
 */

const mongoose = require('mongoose');

// Rollback statistics
const stats = {
  parts: { total: 0, rolled_back: 0, failed: 0 },
  services: { total: 0, rolled_back: 0, failed: 0 },
  inspectionTemplates: { total: 0, rolled_back: 0, failed: 0 },
  inspections: { total: 0, rolled_back: 0, failed: 0 },
};

/**
 * Rollback Parts
 */
async function rollbackParts() {
  console.log('\n=== Rolling back Parts ===');

  const Part = mongoose.model('Part');
  const parts = await Part.find({ uniqueCode: { $exists: true } });

  stats.parts.total = parts.length;
  console.log(`Found ${parts.length} parts with uniqueCode`);

  for (const part of parts) {
    try {
      part.uniqueCode = undefined;
      part.compatibleVehicles = undefined; // Also remove if empty
      await part.save();
      stats.parts.rolled_back++;
      console.log(`  ✓ Removed code from: ${part.name}`);
    } catch (error) {
      stats.parts.failed++;
      console.error(`  ✗ Failed to rollback ${part.name}:`, error.message);
    }
  }

  console.log(`Parts rollback: ${stats.parts.rolled_back}/${stats.parts.total} (${stats.parts.failed} failed)`);
}

/**
 * Rollback Services
 */
async function rollbackServices() {
  console.log('\n=== Rolling back Services ===');

  const Service = mongoose.model('Service');
  const services = await Service.find({ uniqueCode: { $exists: true } });

  stats.services.total = services.length;
  console.log(`Found ${services.length} services with uniqueCode`);

  for (const service of services) {
    try {
      service.uniqueCode = undefined;

      // Also remove uniqueCode from partsRequired
      if (service.partsRequired) {
        service.partsRequired = service.partsRequired.map(part => {
          const { uniqueCode, ...rest } = part.toObject();
          return rest;
        });
      }

      await service.save();
      stats.services.rolled_back++;
      console.log(`  ✓ Removed code from: ${service.name}`);
    } catch (error) {
      stats.services.failed++;
      console.error(`  ✗ Failed to rollback ${service.name}:`, error.message);
    }
  }

  console.log(`Services rollback: ${stats.services.rolled_back}/${stats.services.total} (${stats.services.failed} failed)`);
}

/**
 * Rollback Inspection Templates
 */
async function rollbackInspectionTemplates() {
  console.log('\n=== Rolling back Inspection Templates ===');

  const InspectionTemplate = mongoose.model('InspectionTemplate');
  const templates = await InspectionTemplate.find({});

  stats.inspectionTemplates.total = templates.length;
  console.log(`Found ${templates.length} templates`);

  for (const template of templates) {
    try {
      // Remove uniqueCode from items
      template.items = template.items.map(item => {
        const { uniqueCode, name, ...rest } = item.toObject();
        return rest; // Keep only itemId and category
      });

      await template.save();
      stats.inspectionTemplates.rolled_back++;
      console.log(`  ✓ Removed codes from template: ${template.name}`);
    } catch (error) {
      stats.inspectionTemplates.failed++;
      console.error(`  ✗ Failed to rollback template ${template.name}:`, error.message);
    }
  }

  console.log(`Templates rollback: ${stats.inspectionTemplates.rolled_back}/${stats.inspectionTemplates.total} (${stats.inspectionTemplates.failed} failed)`);
}

/**
 * Rollback Vehicle Inspections
 */
async function rollbackVehicleInspections() {
  console.log('\n=== Rolling back Vehicle Inspections ===');

  const VehicleInspection = mongoose.model('VehicleInspection');
  const inspections = await VehicleInspection.find({});

  stats.inspections.total = inspections.length;
  console.log(`Found ${inspections.length} inspections`);

  for (const inspection of inspections) {
    try {
      // Remove uniqueCode and name from items, restore old condition enum
      inspection.items = inspection.items.map(item => {
        const { uniqueCode, name, ...rest } = item.toObject();
        return rest;
      });

      // Remove new fields
      inspection.jobCardId = undefined;
      inspection.generatedEstimateId = undefined;
      inspection.generatedInvoiceId = undefined;

      await inspection.save();
      stats.inspections.rolled_back++;
      console.log(`  ✓ Rolled back inspection: ${inspection._id}`);
    } catch (error) {
      stats.inspections.failed++;
      console.error(`  ✗ Failed to rollback inspection ${inspection._id}:`, error.message);
    }
  }

  console.log(`Inspections rollback: ${stats.inspections.rolled_back}/${stats.inspections.total} (${stats.inspections.failed} failed)`);
}

/**
 * Rollback Job Cards
 */
async function rollbackJobCards() {
  console.log('\n=== Rolling back Job Cards ===');

  const JobCard = mongoose.model('JobCard');

  try {
    const result = await JobCard.updateMany(
      {},
      {
        $unset: {
          type: '',
          parentJobCardId: '',
          inspectionFeeDeducted: ''
        }
      }
    );

    console.log(`  ✓ Removed new fields from ${result.modifiedCount} job cards`);
  } catch (error) {
    console.error(`  ✗ Failed to rollback job cards:`, error.message);
  }
}

/**
 * Rollback Estimates and Invoices
 */
async function rollbackEstimatesAndInvoices() {
  console.log('\n=== Rolling back Estimates and Invoices ===');

  const Estimate = mongoose.model('Estimate');
  const Invoice = mongoose.model('Invoice');

  try {
    const estimateResult = await Estimate.updateMany(
      {},
      { $unset: { inspectionFee: '' } }
    );
    console.log(`  ✓ Removed inspectionFee from ${estimateResult.modifiedCount} estimates`);

    const invoiceResult = await Invoice.updateMany(
      {},
      {
        $unset: {
          inspectionId: '',
          isInspectionInvoice: ''
        }
      }
    );
    console.log(`  ✓ Removed inspection fields from ${invoiceResult.modifiedCount} invoices`);
  } catch (error) {
    console.error(`  ✗ Failed to rollback estimates/invoices:`, error.message);
  }
}

/**
 * Main rollback function
 */
async function runRollback() {
  try {
    console.log('===========================================');
    console.log('  UNIQUE CODE ROLLBACK SCRIPT');
    console.log('===========================================');
    console.log('\n⚠  WARNING: This will remove all unique codes and related fields!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/teramotors';
    console.log(`\nConnecting to MongoDB: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');

    // Run rollbacks
    await rollbackParts();
    await rollbackServices();
    await rollbackInspectionTemplates();
    await rollbackVehicleInspections();
    await rollbackJobCards();
    await rollbackEstimatesAndInvoices();

    // Print summary
    console.log('\n===========================================');
    console.log('  ROLLBACK SUMMARY');
    console.log('===========================================');
    console.log(`Parts:         ${stats.parts.rolled_back}/${stats.parts.total} (${stats.parts.failed} failed)`);
    console.log(`Services:      ${stats.services.rolled_back}/${stats.services.total} (${stats.services.failed} failed)`);
    console.log(`Templates:     ${stats.inspectionTemplates.rolled_back}/${stats.inspectionTemplates.total} (${stats.inspectionTemplates.failed} failed)`);
    console.log(`Inspections:   ${stats.inspections.rolled_back}/${stats.inspections.total} (${stats.inspections.failed} failed)`);
    console.log('===========================================\n');

    const totalFailed = stats.parts.failed + stats.services.failed + stats.inspectionTemplates.failed + stats.inspections.failed;
    if (totalFailed > 0) {
      console.log(`⚠  WARNING: ${totalFailed} items failed to rollback.`);
      process.exit(1);
    } else {
      console.log('✓ Rollback completed successfully!');
      process.exit(0);
    }

  } catch (error) {
    console.error('\n✗ Rollback failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run rollback
runRollback();
