# Excel Import Guide

This guide explains how to import services and parts from Excel files.

## Services Import

### Required Columns
- **name** (required): Service name
- **price** (required): Service price (used as laborRate)

### Optional Columns
- **description**: Service description
- **category**: Service category
- **laborHours**: Labor hours (defaults to 1 if not provided)

### Example Excel Format for Services
```
| name                    | price | description              | category    | laborHours |
|-------------------------|-------|--------------------------|-------------|------------|
| Oil Change              | 25.00 | Regular oil change       | Maintenance | 1.0        |
| Brake Pad Replacement   | 150.00| Replace front brake pads | Brakes      | 2.5        |
| Tire Rotation           | 30.00 | Rotate all four tires    | Tires       | 0.5        |
```

## Parts Import

### Required Columns
- **name** (required): Part name
- **price** (required): Selling price

### Optional Columns
- **description**: Part description
- **category**: Part category
- **manufacturer**: Part manufacturer
- **cost**: Cost price (defaults to 70% of selling price if not provided)
- **stockQuantity**: Stock quantity (defaults to 0 if not provided)
- **minStockLevel**: Minimum stock level (defaults to 0 if not provided)
- **location**: Storage location
- **partNumber**: Part number

### Example Excel Format for Parts
```
| name                    | price | cost  | description              | category    | manufacturer | stockQuantity | minStockLevel | location | partNumber |
|-------------------------|-------|-------|--------------------------|-------------|--------------|---------------|---------------|----------|------------|
| Oil Filter              | 15.00 | 10.50 | Standard oil filter      | Filters     | AC Delco     | 50            | 10            | A1-B2    | OF-001     |
| Brake Pads (Front)      | 80.00 | 56.00 | Ceramic brake pads       | Brakes      | Brembo       | 20            | 5             | B1-C3    | BP-002     |
| Air Filter              | 25.00 | 17.50 | Engine air filter        | Filters     | K&N          | 30            | 8             | A1-B1    | AF-003     |
```

## File Requirements

- **File Format**: Excel files (.xlsx or .xls)
- **Maximum File Size**: 5MB
- **Maximum Rows**: 1000 rows per import
- **First Row**: Should contain column headers
- **Data Rows**: Start from the second row

## How to Use

1. Go to the Services or Inventory page
2. Click the "Import from Excel" button
3. Select your Excel file
4. The system will validate the data and show any errors
5. Click "Import File" to complete the import

## Notes

- Category fields are now optional for both services and parts
- Labor hours for services defaults to 1 if not specified
- Cost for parts defaults to 70% of the selling price if not specified
- Stock quantities default to 0 if not specified
- All imported items will be marked as active by default
