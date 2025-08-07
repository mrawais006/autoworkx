/**
 * Google Apps Script for AutoworkX Form Handler
 * This script receives form submissions from your website and saves them to Google Sheets
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheets document (https://sheets.google.com)
 * 2. Name it "AutoworkX Bookings" or similar
 * 3. Create column headers in row 1: Name, Phone, Email, Service, Message, Timestamp, Source
 * 4. Go to Extensions > Apps Script in your Google Sheet
 * 5. Replace the default code with this script
 * 6. Update the SHEET_ID and SHEET_NAME variables below
 * 7. Deploy as web app (Execute as: Me, Access: Anyone)
 * 8. Copy the deployment URL to your React app
 */

// Configuration - UPDATE THESE VALUES
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Get this from your Google Sheets URL
const SHEET_NAME = 'Bookings'; // Name of the sheet tab

// Optional: Email notifications
const SEND_EMAIL_NOTIFICATIONS = true;
const NOTIFICATION_EMAIL = 'your-email@autoworkx.com.au'; // Your email for notifications

/**
 * Main function that handles POST requests from your website
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log('Received booking data:', data);
    
    // Save to Google Sheets
    const result = saveToSheet(data);
    
    // Send email notification if enabled
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      sendEmailNotification(data);
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Booking saved successfully',
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing booking:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
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
    // Open the spreadsheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Prepare the row data
    const rowData = [
      data.name || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.message || '',
      data.timestamp || new Date().toISOString(),
      data.source || 'Website'
    ];
    
    // Add the row to the sheet
    sheet.appendRow(rowData);
    
    console.log('Booking saved to sheet successfully');
    return true;
    
  } catch (error) {
    console.error('Error saving to sheet:', error);
    throw error;
  }
}

/**
 * Send email notification for new bookings
 */
function sendEmailNotification(data) {
  try {
    const subject = `New Booking Request - ${data.name}`;
    
    const body = `
New booking request received from your website:

Customer Details:
- Name: ${data.name}
- Phone: ${data.phone}
- Email: ${data.email}
- Service: ${data.service}
- Message: ${data.message || 'No message provided'}

Submitted: ${data.timestamp}
Source: ${data.source}

Please follow up with the customer as soon as possible.

AutoworkX Booking System
    `;
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: subject,
      body: body
    });
    
    console.log('Email notification sent successfully');
    
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw here - we don't want email errors to break the booking process
  }
}

/**
 * Test function to verify the setup
 */
function testBookingSystem() {
  const testData = {
    name: 'Test Customer',
    phone: '0451109786',
    email: 'test@example.com',
    service: 'Car Maintenance',
    message: 'This is a test booking',
    timestamp: new Date().toISOString(),
    source: 'Test'
  };
  
  try {
    saveToSheet(testData);
    console.log('Test booking saved successfully!');
    
    if (SEND_EMAIL_NOTIFICATIONS && NOTIFICATION_EMAIL) {
      sendEmailNotification(testData);
      console.log('Test email sent successfully!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

/**
 * Setup function to create the sheet headers if they don't exist
 */
function setupSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    // Check if headers already exist
    const firstRow = sheet.getRange(1, 1, 1, 7).getValues()[0];
    
    if (!firstRow[0]) {
      // Add headers
      const headers = ['Name', 'Phone', 'Email', 'Service', 'Message', 'Timestamp', 'Source'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format the header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      
      console.log('Sheet headers created successfully');
    } else {
      console.log('Sheet headers already exist');
    }
    
  } catch (error) {
    console.error('Error setting up sheet:', error);
    throw error;
  }
}