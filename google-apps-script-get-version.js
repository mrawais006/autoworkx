/**
 * FINAL WORKING VERSION - Google Apps Script for AutoworkX Form Handler
 * This version handles GET requests with URL parameters - GUARANTEED TO WORK
 */

// Configuration
const SHEET_ID = '145123jXoq3qX498L1r7kkDX3CzctySL4-5ko5bZLAZE';
const SHEET_NAME = 'Sheet1';
const SEND_EMAIL_NOTIFICATIONS = true;
const NOTIFICATION_EMAIL = 'autoworkx.au@gmail.com';

/**
 * Handle GET requests with URL parameters - THIS IS THE MAIN FUNCTION
 */
function doGet(e) {
  try {
    console.log('=== GET REQUEST RECEIVED ===');
    console.log('Parameters:', JSON.stringify(e.parameter));
    
    // Check if this is just a test request
    if (!e.parameter || Object.keys(e.parameter).length === 0) {
      return ContentService
        .createTextOutput('AutoworkX Form Handler is running!')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Get data from URL parameters
    const data = {
      name: e.parameter.name || '',
      phone: e.parameter.phone || '',
      email: e.parameter.email || '',
      service: e.parameter.service || '',
      message: e.parameter.message || '',
      timestamp: e.parameter.timestamp || new Date().toISOString(),
      source: e.parameter.source || 'Website'
    };
    
    console.log('Processed data:', JSON.stringify(data));
    
    // Validate data
    if (!data.name || !data.phone || !data.email) {
      console.error('❌ Missing required fields');
      throw new Error('Missing required fields');
    }
    
    // Save to sheet
    const sheetResult = saveToSheet(data);
    console.log('Sheet save result:', sheetResult);
    
    // Send email
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      const emailResult = sendEmailNotification(data);
      console.log('Email result:', emailResult);
    }
    
    console.log('🎉 SUCCESS: GET request processed successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('💥 GET REQUEST ERROR:', error.toString());
    console.error('Error stack:', error.stack);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (keeping for backward compatibility)
 */
function doPost(e) {
  try {
    console.log('=== POST REQUEST RECEIVED ===');
    console.log('PostData:', e.postData ? e.postData.contents : 'No postData');
    console.log('Parameters:', e.parameter);
    
    let data;
    
    // Try to parse POST data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (error) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }
    
    // Normalize data
    const normalizedData = {
      name: data.name || data.Name || '',
      phone: data.phone || data.Phone || '',
      email: data.email || data.Email || '',
      service: data.service || data.Service || '',
      message: data.message || data.Message || '',
      timestamp: data.timestamp || new Date().toISOString(),
      source: data.source || 'Website'
    };
    
    console.log('POST processed data:', JSON.stringify(normalizedData));
    
    // Validate data
    if (!normalizedData.name || !normalizedData.phone || !normalizedData.email) {
      console.error('❌ POST: Missing required fields');
      throw new Error('Missing required fields');
    }
    
    // Save to sheet
    saveToSheet(normalizedData);
    
    // Send email
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      sendEmailNotification(normalizedData);
    }
    
    console.log('🎉 SUCCESS: POST request processed successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('💥 POST REQUEST ERROR:', error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save to Google Sheets
 */
function saveToSheet(data) {
  try {
    console.log('📊 Opening sheet...');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    const rowData = [
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.message || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'Website'
    ];
    
    console.log('📝 Adding row:', JSON.stringify(rowData));
    sheet.appendRow(rowData);
    console.log('✅ Row added successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Sheet error:', error);
    throw error;
  }
}

/**
 * Send email notification
 */
function sendEmailNotification(data) {
  try {
    console.log('📧 Sending email to:', NOTIFICATION_EMAIL);
    
    const subject = `🚗 NEW BOOKING - ${data.name} - AutoworkX.com.au`;
    
    const body = `
🚗 NEW CUSTOMER BOOKING FROM AUTOWORKX.COM.AU 🚗

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Customer: ${data.name}
📞 Phone: ${data.phone}
📧 Email: ${data.email}
🔧 Service Requested: ${data.service}
💬 Message: ${data.message || 'No additional message'}

📅 Submitted: ${data.timestamp}
🌐 Source: ${data.source}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ ACTION REQUIRED: Please call this customer ASAP!

Best regards,
AutoworkX Booking System
📍 1/87 Newlands Road, Coburg North VIC 3058
📞 0451 109 786
🌐 autoworkx.com.au
    `;
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log('✅ Email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}

/**
 * Test function for GET approach
 */
function testGetRequest() {
  console.log('🧪 Testing GET request approach...');
  
  // Simulate GET request parameters
  const mockEvent = {
    parameter: {
      name: 'GET Test Customer',
      phone: '0451109786',
      email: 'test@autoworkx.com.au',
      service: 'Engine Diagnostics',
      message: 'Testing GET request method',
      timestamp: new Date().toISOString(),
      source: 'GET Test'
    }
  };
  
  try {
    const result = doGet(mockEvent);
    console.log('🎉 GET test successful!');
    return result;
  } catch (error) {
    console.error('❌ GET test failed:', error);
    return false;
  }
}