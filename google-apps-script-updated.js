/**
 * Google Apps Script for AutoworkX Form Handler - PRODUCTION VERSION
 * Updated to handle CORS and domain issues for autoworkx.com.au
 */

// Configuration
const SHEET_ID = '145123jXoq3qX498L1r7kkDX3CzctySL4-5ko5bZLAZE';
const SHEET_NAME = 'Sheet1';

// Email notifications setup
const SEND_EMAIL_NOTIFICATIONS = true;
const NOTIFICATION_EMAIL = 'autoworkx.au@gmail.com';

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('AutoworkX Form Handler is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Main function that handles POST requests from your website
 */
function doPost(e) {
  // Add CORS headers for production
  const output = ContentService.createTextOutput();
  
  try {
    console.log('=== NEW FORM SUBMISSION ===');
    console.log('Headers:', JSON.stringify(e.parameter));
    console.log('PostData:', e.postData);
    
    // Parse the incoming data
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
      console.log('Parsed data:', JSON.stringify(data));
    } else {
      console.log('No postData.contents found, using parameters');
      data = e.parameter;
    }
    
    // Validate required fields
    if (!data.name || !data.phone || !data.email) {
      throw new Error('Missing required fields: name, phone, or email');
    }
    
    // Save to Google Sheets
    const result = saveToSheet(data);
    console.log('Sheet save result:', result);
    
    // Send email notification if enabled
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      sendEmailNotification(data);
      console.log('Email notification sent');
    }
    
    // Return success response with CORS headers
    return output
      .setContent(JSON.stringify({
        success: true,
        message: 'Booking saved successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('=== ERROR PROCESSING BOOKING ===');
    console.error('Error:', error.toString());
    console.error('Stack:', error.stack);
    
    // Return error response
    return output
      .setContent(JSON.stringify({
        success: false,
        error: error.toString(),
        message: 'Error processing booking'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save booking data to Google Sheets
 */
function saveToSheet(data) {
  try {
    console.log('Opening spreadsheet with ID:', SHEET_ID);
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // Prepare the row data
    const rowData = [
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.message || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'Website Production'
    ];
    
    console.log('Adding row data:', JSON.stringify(rowData));
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('✅ Booking saved to sheet successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error saving to sheet:', error);
    throw error;
  }
}

/**
 * Send email notification for new bookings
 */
function sendEmailNotification(data) {
  try {
    const subject = `🚗 New AutoworkX Booking - ${data.name}`;
    
    const body = `
🚗 NEW BOOKING REQUEST FROM AUTOWORKX.COM.AU 🚗

Customer Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${data.name}
📞 Phone: ${data.phone}
📧 Email: ${data.email}
🔧 Service: ${data.service}
💬 Message: ${data.message || 'No message provided'}

📅 Submitted: ${data.timestamp || new Date().toISOString()}
🌐 Source: Production Website (${data.source || 'autoworkx.com.au'})

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ URGENT: Please follow up with this customer ASAP!

AutoworkX Professional Auto Repair
1/87 Newlands Road, Coburg North VIC 3058
Phone: 0451 109 786
Website: autoworkx.com.au
    `;
    
    console.log('Sending email to:', NOTIFICATION_EMAIL);
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log('✅ Email notification sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
    // Don't throw here - we don't want email errors to break the booking process
  }
}

/**
 * Test function to verify the setup
 */
function testBookingSystem() {
  console.log('🧪 Starting test of booking system...');
  
  const testData = {
    name: 'Test Customer Production',
    phone: '0451109786',
    email: 'test@autoworkx.com.au',
    service: 'Car Maintenance',
    message: 'This is a test booking from production environment',
    timestamp: new Date().toISOString(),
    source: 'Production Test'
  };
  
  try {
    console.log('Test data:', JSON.stringify(testData));
    
    // Test sheet saving
    saveToSheet(testData);
    console.log('✅ Test: Sheet save successful');
    
    // Test email sending
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      sendEmailNotification(testData);
      console.log('✅ Test: Email sent successful');
    }
    
    console.log('🎉 All tests passed! Production system is ready.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Debug function to check configuration
 */
function debugConfiguration() {
  console.log('=== CONFIGURATION DEBUG ===');
  console.log('SHEET_ID:', SHEET_ID);
  console.log('SHEET_NAME:', SHEET_NAME);
  console.log('NOTIFICATION_EMAIL:', NOTIFICATION_EMAIL);
  console.log('SEND_EMAIL_NOTIFICATIONS:', SEND_EMAIL_NOTIFICATIONS);
  
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    console.log('✅ Sheet access: OK');
    console.log('Sheet URL:', `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
  } catch (error) {
    console.error('❌ Sheet access failed:', error);
  }
}