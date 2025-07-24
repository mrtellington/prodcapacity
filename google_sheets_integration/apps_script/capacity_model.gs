/**
 * Capacity Model Google Apps Script
 * Processes sales data and applies matrix criteria to generate capacity model
 */

// Main function to process data and create capacity model
function createCapacityModel() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = spreadsheet.getSheetByName('Sheet1');
  const matrixSheet = spreadsheet.getSheetByName('Matrix');
  
  if (!sheet1) {
    throw new Error('Sheet1 not found. Please ensure your raw data is in Sheet1.');
  }
  
  if (!matrixSheet) {
    createMatrixSheet();
  }
  
  // Get matrix criteria
  const matrixCriteria = getMatrixCriteria();
  
  // Process data
  const capacityData = processSalesData(sheet1, matrixCriteria);
  
  // Create or update Capacity Model sheet
  createCapacityModelSheet(capacityData);
  
  // Add menu item
  addMenu();
  
  Logger.log('Capacity Model created successfully!');
}

// Get matrix criteria from Matrix sheet
function getMatrixCriteria() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const matrixSheet = spreadsheet.getSheetByName('Matrix');
  
  if (!matrixSheet) {
    throw new Error('Matrix sheet not found. Please create the Matrix sheet first.');
  }
  
  const data = matrixSheet.getDataRange().getValues();
  const criteria = {};
  
  // Skip header row and process criteria
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) { // Role and Criteria are not empty
      criteria[row[0]] = row[1];
    }
  }
  
  return criteria;
}

// Process sales data and apply matrix logic
function processSalesData(sheet1, matrixCriteria) {
  const data = sheet1.getDataRange().getValues();
  const headers = data[0];
  
  // Find column indices
  const salesRepFirstIndex = headers.indexOf('Sales Rep First');
  const salesRepLastIndex = headers.indexOf('Sales Rep Last');
  const subtotalIndex = headers.indexOf('Subtotal');
  const shipToCountryIndex = headers.indexOf('ShipTo Country');
  
  // Find project-related columns (assuming they contain project information)
  const projectColumns = headers.filter(header => 
    header.toLowerCase().includes('project') || 
    header.toLowerCase().includes('description') ||
    header.toLowerCase().includes('item')
  );
  
  const projectColumnIndices = projectColumns.map(col => headers.indexOf(col));
  
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
    
    // Analyze project for matrix criteria
    const projectInfo = projectColumnIndices.map(index => row[index]).join(' ').toLowerCase();
    const matrixMatch = analyzeProjectMatrix(projectInfo, matrixCriteria);
    
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

// Analyze project against matrix criteria
function analyzeProjectMatrix(projectInfo, matrixCriteria) {
  for (const [role, criteria] of Object.entries(matrixCriteria)) {
    const criteriaList = criteria.toLowerCase().split(',').map(c => c.trim());
    for (const criterion of criteriaList) {
      if (projectInfo.includes(criterion)) {
        return role;
      }
    }
  }
  return 'Production Specialist'; // Default fallback
}

// Create or update Capacity Model sheet
function createCapacityModelSheet(capacityData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let capacitySheet = spreadsheet.getSheetByName('Capacity Model');
  
  if (capacitySheet) {
    capacitySheet.clear();
  } else {
    capacitySheet = spreadsheet.insertSheet('Capacity Model');
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
  formatCapacityModelSheet(capacitySheet);
}

// Format the Capacity Model sheet
function formatCapacityModelSheet(sheet) {
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  
  // Format currency column
  sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).setNumberFormat('$#,##0.00');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, 8);
  
  // Add borders
  const dataRange = sheet.getRange(1, 1, sheet.getLastRow(), 8);
  dataRange.setBorder(true, true, true, true, true, true);
}

// Create Matrix sheet with default criteria
function createMatrixSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const matrixSheet = spreadsheet.insertSheet('Matrix');
  
  // Set headers
  matrixSheet.getRange(1, 1, 1, 2).setValues([['Role', 'Criteria']]);
  
  // Set default criteria
  const defaultCriteria = [
    ['Admin', 'admin,management,supervision'],
    ['Production Specialist', 'production,assembly,manufacturing'],
    ['Sr. Production Specialist', 'senior,lead,expert,advanced'],
    ['Team Lead', 'team lead,supervisor,coordinator']
  ];
  
  matrixSheet.getRange(2, 1, defaultCriteria.length, 2).setValues(defaultCriteria);
  
  // Format the sheet
  matrixSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  matrixSheet.getRange(1, 1, 1, 2).setBackground('#34a853');
  matrixSheet.getRange(1, 1, 1, 2).setFontColor('white');
  matrixSheet.autoResizeColumns(1, 2);
  
  Logger.log('Matrix sheet created with default criteria');
}

// Add menu item to the spreadsheet
function addMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Capacity Model')
    .addItem('Generate Capacity Model', 'createCapacityModel')
    .addSeparator()
    .addItem('Refresh Matrix Criteria', 'refreshMatrixCriteria')
    .addToUi();
}

// Refresh matrix criteria and regenerate model
function refreshMatrixCriteria() {
  const matrixCriteria = getMatrixCriteria();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet1 = spreadsheet.getSheetByName('Sheet1');
  
  if (sheet1) {
    const capacityData = processSalesData(sheet1, matrixCriteria);
    createCapacityModelSheet(capacityData);
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

// Initialize the spreadsheet with menu and matrix sheet
function onOpen() {
  addMenu();
  
  // Create matrix sheet if it doesn't exist
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet.getSheetByName('Matrix')) {
    createMatrixSheet();
  }
} 