/**
 * FINAL PRODUCTION VERSION - Google Apps Script for AutoworkX Form Handler
 * This version handles all production domain issues
 */

// Configuration
const SHEET_ID = '145123jXoq3qX498L1r7kkDX3CzctySL4-5ko5bZLAZE';
const SHEET_NAME = 'Sheet1';
const SEND_EMAIL_NOTIFICATIONS = true;
const NOTIFICATION_EMAIL = 'autoworkx.au@gmail.com';

/**
 * Handle GET requests
 */
function doGet(e) {
  return ContentService
    .createTextOutput('AutoworkX Form Handler is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Handle POST requests - PRODUCTION VERSION
 */
function doPost(e) {
  try {
    console.log('=== PRODUCTION FORM SUBMISSION ===');
    console.log('Request source:', e);
    console.log('PostData type:', typeof e.postData);
    console.log('PostData contents:', e.postData ? e.postData.contents : 'No postData');
    console.log('Parameters:', e.parameter);
    
    let data;
    
    // Try multiple ways to parse the data
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
        console.log('✅ Parsed from postData.contents');
      } catch (error) {
        console.log('❌ Failed to parse postData.contents:', error);
        data = e.parameter;
      }
    } else {
      data = e.parameter;
      console.log('Using parameters as fallback');
    }
    
    console.log('Final data object:', JSON.stringify(data));
    
    // Validate data
    if (!data || (!data.name && !data.Name)) {
      console.error('❌ No valid data received');
      throw new Error('No form data received');
    }
    
    // Normalize field names (handle both lowercase and uppercase)
    const normalizedData = {
      name: data.name || data.Name || '',
      phone: data.phone || data.Phone || '',
      email: data.email || data.Email || '',
      service: data.service || data.Service || '',
      message: data.message || data.Message || '',
      timestamp: data.timestamp || new Date().toISOString(),
      source: 'Production Website (autoworkx.com.au)'
    };
    
    console.log('Normalized data:', JSON.stringify(normalizedData));
    
    // Save to sheet
    const sheetResult = saveToSheet(normalizedData);
    console.log('Sheet save result:', sheetResult);
    
    // Send email
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      const emailResult = sendEmailNotification(normalizedData);
      console.log('Email result:', emailResult);
    }
    
    console.log('🎉 SUCCESS: Form processed successfully');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('💥 PRODUCTION ERROR:', error.toString());
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
      data.source || 'Production Website'
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
    
    const subject = `🚗 NEW BOOKING - ${data.name} - AutoworkX`;
    
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
 * Test function
 */
function testProductionBooking() {
  console.log('🧪 Testing production booking...');
  
  const testData = {
    name: 'Production Test Customer',
    phone: '0451109786',
    email: 'test@autoworkx.com.au',
    service: 'Brake Repair',
    message: 'Testing production form submission',
    timestamp: new Date().toISOString(),
    source: 'Production Test'
  };
  
  try {
    saveToSheet(testData);
    sendEmailNotification(testData);
    console.log('🎉 Production test successful!');
  } catch (error) {
    console.error('❌ Production test failed:', error);
  }
}