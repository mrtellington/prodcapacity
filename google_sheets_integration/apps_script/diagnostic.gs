/**
 * Diagnostic Script for Sheet1 Column Analysis
 * Run this to see what columns you actually have in Sheet1
 */

function diagnoseSheet1() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet1 = spreadsheet.getSheetByName('Sheet1');
    
    if (!sheet1) {
      Logger.log('❌ Sheet1 not found!');
      return;
    }
    
    Logger.log('✅ Sheet1 found');
    
    // Get all data
    const data = sheet1.getDataRange().getValues();
    const headers = data[0];
    const rowCount = data.length;
    const colCount = headers.length;
    
    Logger.log(`📊 Sheet1 has ${rowCount} rows and ${colCount} columns`);
    Logger.log('');
    Logger.log('📋 ALL COLUMN HEADERS:');
    Logger.log('=' * 50);
    
    headers.forEach((header, index) => {
      Logger.log(`${index + 1}. "${header}"`);
    });
    
    Logger.log('');
    Logger.log('🔍 SEARCHING FOR SIMILAR COLUMNS:');
    Logger.log('=' * 50);
    
    // Look for sales rep related columns
    const salesRepColumns = headers.filter(header => 
      header.toLowerCase().includes('sales') || 
      header.toLowerCase().includes('rep') || 
      header.toLowerCase().includes('name') ||
      header.toLowerCase().includes('first') ||
      header.toLowerCase().includes('last')
    );
    
    if (salesRepColumns.length > 0) {
      Logger.log('Found potential Sales Rep columns:');
      salesRepColumns.forEach(col => Logger.log(`  - "${col}"`));
    } else {
      Logger.log('❌ No Sales Rep related columns found');
    }
    
    // Look for amount/price related columns
    const amountColumns = headers.filter(header => 
      header.toLowerCase().includes('total') || 
      header.toLowerCase().includes('amount') || 
      header.toLowerCase().includes('price') ||
      header.toLowerCase().includes('subtotal') ||
      header.toLowerCase().includes('sales') ||
      header.toLowerCase().includes('revenue')
    );
    
    if (amountColumns.length > 0) {
      Logger.log('');
      Logger.log('Found potential Amount columns:');
      amountColumns.forEach(col => Logger.log(`  - "${col}"`));
    }
    
    // Look for country/location columns
    const countryColumns = headers.filter(header => 
      header.toLowerCase().includes('country') || 
      header.toLowerCase().includes('location') || 
      header.toLowerCase().includes('ship') ||
      header.toLowerCase().includes('address')
    );
    
    if (countryColumns.length > 0) {
      Logger.log('');
      Logger.log('Found potential Country/Location columns:');
      countryColumns.forEach(col => Logger.log(`  - "${col}"`));
    }
    
    // Show first few rows of data
    Logger.log('');
    Logger.log('📄 FIRST 3 ROWS OF DATA:');
    Logger.log('=' * 50);
    
    for (let i = 0; i < Math.min(3, rowCount); i++) {
      Logger.log(`Row ${i + 1}: ${data[i].join(' | ')}`);
    }
    
    Logger.log('');
    Logger.log('💡 RECOMMENDATIONS:');
    Logger.log('=' * 50);
    
    if (salesRepColumns.length >= 2) {
      Logger.log('✅ You have Sales Rep columns. You may need to rename them to:');
      Logger.log('   - "Sales Rep First"');
      Logger.log('   - "Sales Rep Last"');
    } else {
      Logger.log('❌ You need to add or rename columns to include:');
      Logger.log('   - "Sales Rep First"');
      Logger.log('   - "Sales Rep Last"');
    }
    
    if (amountColumns.length > 0) {
      Logger.log('✅ You have amount columns. Consider renaming one to "Subtotal"');
    } else {
      Logger.log('❌ You may want to add a "Subtotal" column for sales amounts');
    }
    
    if (countryColumns.length > 0) {
      Logger.log('✅ You have location columns. Consider renaming one to "ShipTo Country"');
    } else {
      Logger.log('❌ You may want to add a "ShipTo Country" column for international tracking');
    }
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
}

/**
 * Quick fix function - renames common column variations to expected names
 */
function fixColumnNames() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet1 = spreadsheet.getSheetByName('Sheet1');
    
    if (!sheet1) {
      Logger.log('❌ Sheet1 not found!');
      return;
    }
    
    const headers = sheet1.getRange(1, 1, 1, sheet1.getLastColumn()).getValues()[0];
    let changesMade = false;
    
    Logger.log('🔧 Attempting to fix column names...');
    
    // Common variations for Sales Rep First
    const firstNames = ['First Name', 'First', 'Name', 'Sales Rep', 'Rep First', 'Salesperson First'];
    const firstIndex = headers.findIndex(header => firstNames.includes(header));
    
    if (firstIndex !== -1 && headers[firstIndex] !== 'Sales Rep First') {
      sheet1.getRange(1, firstIndex + 1).setValue('Sales Rep First');
      Logger.log(`✅ Renamed "${headers[firstIndex]}" to "Sales Rep First"`);
      changesMade = true;
    }
    
    // Common variations for Sales Rep Last
    const lastNames = ['Last Name', 'Last', 'Surname', 'Rep Last', 'Salesperson Last'];
    const lastIndex = headers.findIndex(header => lastNames.includes(header));
    
    if (lastIndex !== -1 && headers[lastIndex] !== 'Sales Rep Last') {
      sheet1.getRange(1, lastIndex + 1).setValue('Sales Rep Last');
      Logger.log(`✅ Renamed "${headers[lastIndex]}" to "Sales Rep Last"`);
      changesMade = true;
    }
    
    // Common variations for Subtotal
    const subtotalNames = ['Total', 'Amount', 'Price', 'Sales', 'Revenue', 'Value'];
    const subtotalIndex = headers.findIndex(header => subtotalNames.includes(header));
    
    if (subtotalIndex !== -1 && headers[subtotalIndex] !== 'Subtotal') {
      sheet1.getRange(1, subtotalIndex + 1).setValue('Subtotal');
      Logger.log(`✅ Renamed "${headers[subtotalIndex]}" to "Subtotal"`);
      changesMade = true;
    }
    
    if (changesMade) {
      Logger.log('✅ Column names fixed! You can now run createCapacityModel()');
    } else {
      Logger.log('❌ No automatic fixes could be applied. Please check the diagnostic output above.');
    }
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
  }
} 