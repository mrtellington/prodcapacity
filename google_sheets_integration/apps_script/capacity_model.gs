/**
 * Capacity Model Google Apps Script
 * Processes sales data and applies matrix criteria to generate capacity model
 */

// Main function to process data and create capacity model
function createCapacityModel() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet1 = spreadsheet.getSheetByName('Sheet1');
    const matrixSheet = spreadsheet.getSheetByName('Matrix');
    
    Logger.log('Starting Capacity Model generation...');
    
    if (!sheet1) {
      throw new Error('Sheet1 not found. Please ensure your raw data is in Sheet1.');
    }
    
    Logger.log('Sheet1 found. Checking data...');
    
    // Check if Sheet1 has data
    const dataRange = sheet1.getDataRange();
    const rowCount = dataRange.getNumRows();
    const colCount = dataRange.getNumColumns();
    
    Logger.log(`Sheet1 has ${rowCount} rows and ${colCount} columns`);
    
    if (rowCount < 2) {
      throw new Error('Sheet1 must have at least 2 rows (header + data). Current rows: ' + rowCount);
    }
    
    if (!matrixSheet) {
      Logger.log('Creating Matrix sheet...');
      createMatrixSheet();
    } else {
      // Check if Matrix needs upgrade to new structure
      upgradeMatrixSheet();
    }
    
    // Get matrix criteria with sales bands
    const matrixCriteria = getMatrixCriteria();
    Logger.log('Matrix criteria loaded: ' + Object.keys(matrixCriteria).length + ' roles');
    
    // Process data
    Logger.log('Processing sales data...');
    const capacityData = processSalesData(sheet1, matrixCriteria);
    Logger.log('Processed ' + capacityData.length + ' sales reps');
    
    // Create or update Capacity Rep Projection sheet
    Logger.log('Creating Capacity Rep Projection sheet...');
    createCapacityRepProjectionSheet(capacityData);
    
    // Create or update Capacity Summary sheet
    Logger.log('Creating Capacity Summary sheet...');
    createCapacitySummarySheet(capacityData, matrixCriteria);
    
    // Add menu item
    addMenu();
    
    Logger.log('Capacity Model created successfully!');
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    throw error;
  }
}

// Get matrix criteria from Matrix sheet (now includes sales bands)
function getMatrixCriteria() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const matrixSheet = spreadsheet.getSheetByName('Matrix');
  
  if (!matrixSheet) {
    throw new Error('Matrix sheet not found. Please create the Matrix sheet first.');
  }
  
  const data = matrixSheet.getDataRange().getValues();
  const criteria = {};
  
  // Check if Matrix has old 2-column structure or new 4-column structure
  const hasSalesBands = data.length > 0 && data[0].length >= 4;
  
  Logger.log(`Matrix structure detected: ${data[0].length} columns (hasSalesBands: ${hasSalesBands})`);
  
  // Skip header row and process criteria
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) { // Role and Criteria are not empty
      if (hasSalesBands) {
        // New 4-column structure with sales bands
        criteria[row[0]] = {
          keywords: row[1],
          minSales: parseFloat(row[2]) || 0,
          maxSales: parseFloat(row[3]) || 999999999
        };
      } else {
        // Old 2-column structure - convert to new format with default sales bands
        criteria[row[0]] = {
          keywords: row[1],
          minSales: 0,
          maxSales: 999999999
        };
      }
    }
  }
  
  return criteria;
}

// Process sales data and apply matrix logic with sales bands
function processSalesData(sheet1, matrixCriteria) {
  const data = sheet1.getDataRange().getValues();
  const headers = data[0];
  
  Logger.log('Headers found: ' + headers.join(', '));
  
  // Find column indices
  const salesRepFirstIndex = headers.indexOf('Sales Rep First');
  const salesRepLastIndex = headers.indexOf('Sales Rep Last');
  const subtotalIndex = headers.indexOf('Subtotal');
  const shipToCountryIndex = headers.indexOf('ShipTo Country');
  
  Logger.log(`Column indices - Sales Rep First: ${salesRepFirstIndex}, Sales Rep Last: ${salesRepLastIndex}, Subtotal: ${subtotalIndex}, ShipTo Country: ${shipToCountryIndex}`);
  
  // Check if required columns exist
  if (salesRepFirstIndex === -1 || salesRepLastIndex === -1) {
    throw new Error('Required columns not found. Please ensure Sheet1 has "Sales Rep First" and "Sales Rep Last" columns.');
  }
  
  if (subtotalIndex === -1) {
    Logger.log('Warning: "Subtotal" column not found. Sales amounts will be set to 0.');
  }
  
  // Find project-related columns (assuming they contain project information)
  const projectColumns = headers.filter(header => 
    header.toLowerCase().includes('project') || 
    header.toLowerCase().includes('description') ||
    header.toLowerCase().includes('item')
  );
  
  const projectColumnIndices = projectColumns.map(col => headers.indexOf(col));
  Logger.log('Project columns found: ' + projectColumns.join(', '));
  
  // Group data by Sales Rep
  const groupedData = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const salesRepFirst = row[salesRepFirstIndex] || '';
    const salesRepLast = row[salesRepLastIndex] || '';
    const salesRepKey = `${salesRepFirst} ${salesRepLast}`.trim();
    
    if (!salesRepKey) continue;
    
    if (!groupedData[salesRepKey]) {
      groupedData[salesRepKey] = {
        salesRepFirst: salesRepFirst,
        salesRepLast: salesRepLast,
        totalSales: 0,
        adminCount: 0,
        prodSpecCount: 0,
        srProdCount: 0,
        teamLeadCount: 0,
        intlProjectCount: 0,
        projects: []
      };
    }
    
    // Add sales
    const subtotal = parseFloat(row[subtotalIndex]) || 0;
    groupedData[salesRepKey].totalSales += subtotal;
    
    // Check if international project
    const shipToCountry = row[shipToCountryIndex] || '';
    if (shipToCountry.toLowerCase() !== 'united states') {
      groupedData[salesRepKey].intlProjectCount++;
    }
    
    // Analyze project for matrix criteria with sales bands
    const projectInfo = projectColumnIndices.map(index => row[index]).join(' ').toLowerCase();
    const matrixMatch = analyzeProjectMatrixWithSalesBands(projectInfo, subtotal, matrixCriteria);
    
    switch (matrixMatch) {
      case 'Admin':
        groupedData[salesRepKey].adminCount++;
        break;
      case 'Production Specialist':
        groupedData[salesRepKey].prodSpecCount++;
        break;
      case 'Sr. Production Specialist':
        groupedData[salesRepKey].srProdCount++;
        break;
      case 'Team Lead':
        groupedData[salesRepKey].teamLeadCount++;
        break;
    }
  }
  
  return Object.values(groupedData);
}

// Analyze project against matrix criteria with sales bands
function analyzeProjectMatrixWithSalesBands(projectInfo, projectSales, matrixCriteria) {
  // First check sales bands
  for (const [role, criteria] of Object.entries(matrixCriteria)) {
    if (projectSales >= criteria.minSales && projectSales <= criteria.maxSales) {
      // Then check keywords
      const criteriaList = criteria.keywords.toLowerCase().split(',').map(c => c.trim());
      for (const criterion of criteriaList) {
        if (projectInfo.includes(criterion)) {
          return role;
        }
      }
    }
  }
  
  // If no match found, assign based on sales bands only
  for (const [role, criteria] of Object.entries(matrixCriteria)) {
    if (projectSales >= criteria.minSales && projectSales <= criteria.maxSales) {
      return role;
    }
  }
  
  return 'Production Specialist'; // Default fallback
}

// Create or update Capacity Rep Projection sheet (renamed from Capacity Model)
function createCapacityRepProjectionSheet(capacityData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = spreadsheet.getSheetByName('Capacity Rep Projection');
  
  if (capacitySheet) {
    capacitySheet.clear();
  } else {
    capacitySheet = spreadsheet.insertSheet('Capacity Rep Projection');
  }
  
  // Set headers
  const headers = [
    'Sales Rep First',
    'Sales Rep Last', 
    'Sales ($)',
    'Admin Count',
    'Prod Spec Count',
    'Sr. Prod Count',
    'Team Lead Count',
    'Intl Project Count'
  ];
  
  capacitySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Set data
  const data = capacityData.map(rep => [
    rep.salesRepFirst,
    rep.salesRepLast,
    rep.totalSales,
    rep.adminCount,
    rep.prodSpecCount,
    rep.srProdCount,
    rep.teamLeadCount,
    rep.intlProjectCount
  ]);
  
  if (data.length > 0) {
    capacitySheet.getRange(2, 1, data.length, headers.length).setValues(data);
  }
  
  // Format the sheet
  formatCapacityRepProjectionSheet(capacitySheet);
}

// Format the Capacity Rep Projection sheet
function formatCapacityRepProjectionSheet(sheet) {
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  // Only format data rows if there are any
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    // Format currency column
    sheet.getRange(2, 3, lastRow - 1, 1).setNumberFormat('$#,##0.00');
    
    // Add borders to data
    const dataRange = sheet.getRange(1, 1, lastRow, 8);
    dataRange.setBorder(true, true, true, true, true, true);
  } else {
    // Just add borders to header row
    headerRange.setBorder(true, true, true, true, true, true);
  }
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 8);
}

// Create Capacity Summary sheet with aggregated data
function createCapacitySummarySheet(capacityData, matrixCriteria) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let summarySheet = spreadsheet.getSheetByName('Capacity Summary');
  
  if (summarySheet) {
    summarySheet.clear();
  } else {
    summarySheet = spreadsheet.insertSheet('Capacity Summary');
  }
  
  // Calculate summary statistics
  const totalSalesReps = capacityData.length;
  const totalSales = capacityData.reduce((sum, rep) => sum + rep.totalSales, 0);
  const avgSalesPerRep = totalSalesReps > 0 ? totalSales / totalSalesReps : 0;
  
  const totalProjects = capacityData.reduce((sum, rep) => 
    sum + rep.adminCount + rep.prodSpecCount + rep.srProdCount + rep.teamLeadCount, 0);
  
  const totalIntlProjects = capacityData.reduce((sum, rep) => sum + rep.intlProjectCount, 0);
  
  // Find top performer
  const topPerformer = capacityData.reduce((top, rep) => 
    rep.totalSales > top.totalSales ? rep : top, { totalSales: 0 });
  
  // Project distribution
  const projectDistribution = {
    'Admin': capacityData.reduce((sum, rep) => sum + rep.adminCount, 0),
    'Production Specialist': capacityData.reduce((sum, rep) => sum + rep.prodSpecCount, 0),
    'Sr. Production Specialist': capacityData.reduce((sum, rep) => sum + rep.srProdCount, 0),
    'Team Lead': capacityData.reduce((sum, rep) => sum + rep.teamLeadCount, 0)
  };
  
  // Capacity distribution percentages
  const capacityDistribution = {};
  for (const [role, count] of Object.entries(projectDistribution)) {
    capacityDistribution[role] = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
  }
  
  // Set summary data
  const summaryData = [
    ['Capacity Model Summary', ''],
    ['', ''],
    ['Key Metrics', ''],
    ['Total Sales Reps', totalSalesReps],
    ['Total Sales', totalSales],
    ['Average Sales per Rep', avgSalesPerRep],
    ['Total Projects', totalProjects],
    ['International Projects', totalIntlProjects],
    ['', ''],
    ['Top Performer', `${topPerformer.salesRepFirst || ''} ${topPerformer.salesRepLast || ''}`],
    ['Top Performer Sales', topPerformer.totalSales || 0],
    ['', ''],
    ['Project Distribution', ''],
    ['Admin Projects', projectDistribution['Admin']],
    ['Production Specialist Projects', projectDistribution['Production Specialist']],
    ['Sr. Production Specialist Projects', projectDistribution['Sr. Production Specialist']],
    ['Team Lead Projects', projectDistribution['Team Lead']],
    ['', ''],
    ['Capacity Distribution (%)', ''],
    ['Admin Percentage', capacityDistribution['Admin']],
    ['Production Specialist Percentage', capacityDistribution['Production Specialist']],
    ['Sr. Production Specialist Percentage', capacityDistribution['Sr. Production Specialist']],
    ['Team Lead Percentage', capacityDistribution['Team Lead']],
    ['', ''],
    ['Matrix Criteria', ''],
    ['Role', 'Keywords', 'Min Sales ($)', 'Max Sales ($)']
  ];
  
  // Add matrix criteria
  for (const [role, criteria] of Object.entries(matrixCriteria)) {
    summaryData.push([role, criteria.keywords, criteria.minSales, criteria.maxSales]);
  }
  
  // Set data in sheet
  summarySheet.getRange(1, 1, summaryData.length, 4).setValues(summaryData);
  
  // Format the sheet
  formatCapacitySummarySheet(summarySheet, summaryData.length);
}

// Format the Capacity Summary sheet
function formatCapacitySummarySheet(sheet, dataLength) {
  // Format title
  sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setFontSize(14);
  sheet.getRange(1, 1, 1, 4).setBackground('#34a853').setFontColor('white');
  
  // Format section headers
  const sectionHeaders = [3, 13, 19, 25]; // Row numbers for section headers
  sectionHeaders.forEach(row => {
    if (row <= dataLength) {
      sheet.getRange(row, 1, 1, 4).setFontWeight('bold').setBackground('#f1f3f4');
    }
  });
  
  // Format currency columns
  const currencyColumns = [2, 6, 12]; // Column B, F, L for currency values
  currencyColumns.forEach(col => {
    if (col === 2) { // Sales values
      sheet.getRange(5, col, 1, 1).setNumberFormat('$#,##0.00');
      sheet.getRange(6, col, 1, 1).setNumberFormat('$#,##0.00');
      sheet.getRange(12, col, 1, 1).setNumberFormat('$#,##0.00');
    }
  });
  
  // Format percentage columns
  const percentageColumns = [22, 23, 24, 25]; // Percentage rows
  percentageColumns.forEach(row => {
    if (row <= dataLength) {
      sheet.getRange(row, 2, 1, 1).setNumberFormat('0.0%');
    }
  });
  
  // Format matrix criteria section
  const matrixStartRow = 27;
  if (matrixStartRow <= dataLength) {
    sheet.getRange(matrixStartRow, 1, 1, 4).setFontWeight('bold').setBackground('#4285f4').setFontColor('white');
    // Format sales band columns
    sheet.getRange(matrixStartRow + 1, 3, dataLength - matrixStartRow, 2).setNumberFormat('$#,##0.00');
  }
  
  // Add borders
  sheet.getRange(1, 1, dataLength, 4).setBorder(true, true, true, true, true, true);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 4);
}

// Create Matrix sheet with default criteria and sales bands
function createMatrixSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const matrixSheet = spreadsheet.insertSheet('Matrix');
  
  // Set headers
  matrixSheet.getRange(1, 1, 1, 4).setValues([['Role', 'Keywords', 'Min Sales ($)', 'Max Sales ($)']]);
  
  // Set default criteria with sales bands
  const defaultCriteria = [
    ['Admin', 'admin,management,supervision', 0, 1000],
    ['Production Specialist', 'production,assembly,manufacturing', 0, 5000],
    ['Sr. Production Specialist', 'senior,lead,expert,advanced', 5000, 25000],
    ['Team Lead', 'team lead,supervisor,coordinator', 25000, 999999999]
  ];
  
  matrixSheet.getRange(2, 1, defaultCriteria.length, 4).setValues(defaultCriteria);
  
  // Format the sheet
  matrixSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  matrixSheet.getRange(1, 1, 1, 4).setBackground('#34a853');
  matrixSheet.getRange(1, 1, 1, 4).setFontColor('white');
  
  // Format sales band columns
  matrixSheet.getRange(2, 3, defaultCriteria.length, 2).setNumberFormat('$#,##0.00');
  
  matrixSheet.autoResizeColumns(1, 4);
  
  Logger.log('Matrix sheet created with default criteria and sales bands');
}

// Add menu item to the spreadsheet
function addMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Capacity Model')
    .addItem('Generate Capacity Model', 'createCapacityModel')
    .addSeparator()
    .addItem('Refresh Matrix Criteria', 'refreshMatrixCriteria')
    .addItem('Upgrade Matrix to Sales Bands', 'upgradeMatrixSheet')
    .addToUi();
}

// Refresh matrix criteria and regenerate model
function refreshMatrixCriteria() {
  const matrixCriteria = getMatrixCriteria();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = spreadsheet.getSheetByName('Sheet1');
  
  if (sheet1) {
    const capacityData = processSalesData(sheet1, matrixCriteria);
    createCapacityRepProjectionSheet(capacityData);
    createCapacitySummarySheet(capacityData, matrixCriteria);
    Logger.log('Capacity Model refreshed with updated matrix criteria');
  }
}

// Webhook function for external triggering
function doPost(e) {
  try {
    // Verify the request (you can add authentication here)
    const requestData = JSON.parse(e.postData.contents);
    
    // Process the request
    if (requestData.action === 'generate_capacity_model') {
      createCapacityModel();
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Capacity Model generated successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid action specified'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Upgrade Matrix sheet from old 2-column to new 4-column structure
function upgradeMatrixSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const matrixSheet = spreadsheet.getSheetByName('Matrix');
  
  if (!matrixSheet) {
    Logger.log('Matrix sheet not found. Creating new one...');
    createMatrixSheet();
    return;
  }
  
  const data = matrixSheet.getDataRange().getValues();
  
  // Check if already has 4 columns
  if (data.length > 0 && data[0].length >= 4) {
    Logger.log('Matrix sheet already has 4 columns. No upgrade needed.');
    return;
  }
  
  Logger.log('Upgrading Matrix sheet from 2-column to 4-column structure...');
  
  // Clear the sheet
  matrixSheet.clear();
  
  // Set new headers
  matrixSheet.getRange(1, 1, 1, 4).setValues([['Role', 'Keywords', 'Min Sales ($)', 'Max Sales ($)']]);
  
  // Set default criteria with sales bands
  const defaultCriteria = [
    ['Admin', 'admin,management,supervision', 0, 1000],
    ['Production Specialist', 'production,assembly,manufacturing', 0, 5000],
    ['Sr. Production Specialist', 'senior,lead,expert,advanced', 5000, 25000],
    ['Team Lead', 'team lead,supervisor,coordinator', 25000, 999999999]
  ];
  
  matrixSheet.getRange(2, 1, defaultCriteria.length, 4).setValues(defaultCriteria);
  
  // Format the sheet
  matrixSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  matrixSheet.getRange(1, 1, 1, 4).setBackground('#34a853');
  matrixSheet.getRange(1, 1, 1, 4).setFontColor('white');
  
  // Format sales band columns
  matrixSheet.getRange(2, 3, defaultCriteria.length, 2).setNumberFormat('$#,##0.00');
  
  matrixSheet.autoResizeColumns(1, 4);
  
  Logger.log('Matrix sheet upgraded successfully!');
}

// Initialize the spreadsheet with menu and matrix sheet
function onOpen() {
  addMenu();
  
  // Create matrix sheet if it doesn't exist
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet.getSheetByName('Matrix')) {
    createMatrixSheet();
  } else {
    // Check if Matrix needs upgrade
    upgradeMatrixSheet();
  }
} 