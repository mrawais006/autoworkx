# 🚀 Google Apps Script Setup for AutoworkX Form Handler

## ✅ Current Status
Your form is now connected to your deployed Google Apps Script! Here's what we've set up:

### Form Integration Complete:
- ✅ Form validation (name, phone, email, service required)
- ✅ Phone and email format validation  
- ✅ Submit button with loading state
- ✅ Error handling and user feedback
- ✅ Connected to your deployed script: `AKfycbxsxQ_OXPVbK_A6BP_r1MIZjsoLZdshOhUNv2Waq74Y7mA9ONWUE7AQ1-DwwA0lw3t`

## 📋 What You Need to Do Next

### 1. Set Up Your Google Sheet (5 minutes)

1. **Create a new Google Sheet**:
   - Go to [sheets.google.com](https://sheets.google.com)
   - Click "Create" to make a new spreadsheet
   - Name it "AutoworkX Bookings"

2. **Add column headers** in row 1:
   ```
   A1: Name
   B1: Phone  
   C1: Email
   D1: Service
   E1: Message
   F1: Timestamp
   G1: Source
   ```

3. **Get your Sheet ID**:
   - Look at your Google Sheets URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Copy the Sheet ID from the URL

### 2. Update Your Google Apps Script

1. **Open Apps Script**:
   - In your Google Sheet, go to **Extensions > Apps Script**
   - You should see your existing deployed script

2. **Update the script**:
   - Replace the existing code with the code from `google-apps-script.js` file I created
   - Update these variables at the top:
     ```javascript
     const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE';
     const SHEET_NAME = 'Bookings'; // Or whatever you named your sheet tab
     const NOTIFICATION_EMAIL = 'your-email@autoworkx.com.au';
     ```

3. **Save and test**:
   - Save the script (Ctrl/Cmd + S)
   - Run the `setupSheet()` function once to create headers
   - Run the `testBookingSystem()` function to test

### 3. Verify the Integration

1. **Test your website form**:
   - Start your dev server: `npm run dev`
   - Fill out the booking form on your website
   - Submit it and check that:
     - ✅ You see a success message
     - ✅ Data appears in your Google Sheet
     - ✅ You receive an email notification (if enabled)

## 🔧 Script Features

### What the Script Does:
- ✅ Receives form data from your website
- ✅ Validates and saves data to Google Sheets
- ✅ Sends email notifications for new bookings
- ✅ Handles errors gracefully
- ✅ Logs all activity for debugging

### Data Structure:
Each booking saves these fields:
- **Name**: Customer's full name
- **Phone**: Contact phone number
- **Email**: Customer's email address
- **Service**: Selected service type
- **Message**: Customer's description/notes
- **Timestamp**: When the booking was submitted
- **Source**: Always "Website Booking Form"

## 🚨 Important Notes

### Security:
- ✅ The script is deployed with your Google account permissions
- ✅ Only your website can submit data (CORS configured)
- ✅ All data is stored in your private Google Sheet

### Rate Limits:
- Google Apps Script has usage quotas
- For normal business use, you won't hit these limits
- Monitor if you get many bookings per day

### Troubleshooting:
If form submissions aren't working:

1. **Check the Google Apps Script logs**:
   - Go to your Apps Script project
   - Click "Executions" to see recent runs
   - Check for any error messages

2. **Verify Sheet permissions**:
   - Make sure the Sheet ID is correct
   - Ensure the sheet tab name matches `SHEET_NAME`

3. **Test the script directly**:
   - Run `testBookingSystem()` in Apps Script
   - Check if test data appears in your sheet

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Check Google Apps Script execution logs
3. Verify your Sheet ID and sheet name are correct
4. Let me know what error messages you're seeing!

## 🎉 You're All Set!

Once this is configured, you'll have a complete booking system that:
- ✅ Captures customer information from your website
- ✅ Stores it securely in Google Sheets  
- ✅ Notifies you via email
- ✅ Provides a professional user experience

Your customers can now book services directly from your website! 🚀