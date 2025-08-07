# Google My Business API Setup Guide

## Step-by-Step API Setup Process

### Step 1: Create Google Cloud Project
1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Sign in** with your Google account (same one used for your business)
3. **Click** "Create Project" (top left)
4. **Name your project**: "AutoworkX Reviews API"
5. **Click** "Create"

### Step 2: Enable Google My Business API
1. **Go to**: [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. **Search for**: "Google My Business API" or "Business Profile API"
3. **Click** on "Google My Business API"
4. **Click** "Enable"

### Step 3: Create API Credentials
1. **Go to**: [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. **Click** "Create Credentials" → "API key"
3. **Copy the API key** (keep this safe!)
4. **Optional**: Click "Restrict Key" and limit to "Google My Business API" for security

### Step 4: Set Up OAuth 2.0 (Required for Business Profile)
1. **Go to**: [APIs & Services > OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent)
2. **Choose** "External" user type
3. **Fill out**:
   - App name: "AutoworkX Website"
   - User support email: Your email
   - Developer contact: Your email
4. **Click** "Save and Continue"
5. **Skip** scopes section (click "Save and Continue")
6. **Add test users**: Add your Google account email
7. **Click** "Save and Continue"

### Step 5: Create OAuth 2.0 Client
1. **Go back to**: [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. **Click** "Create Credentials" → "OAuth 2.0 Client IDs"
3. **Application type**: "Web application"
4. **Name**: "AutoworkX Reviews Client"
5. **Authorized JavaScript origins**: Add `http://localhost:5173` (for dev)
6. **Authorized redirect URIs**: Add `http://localhost:5173/auth/callback`
7. **Click** "Create"
8. **Copy both**:
   - Client ID
   - Client Secret

### Step 6: Find Your Business Location ID
This is the trickiest part. You have a few options:

#### Option A: Use Google My Business API Explorer
1. **Go to**: [APIs Explorer](https://developers.google.com/my-business/reference/rest/v4/accounts/list)
2. **Click** "Try this API"
3. **Authorize** with your business Google account
4. **Execute** - this will show your accounts
5. **Copy the account name** (format: `accounts/123456789`)
6. **Go to**: [Locations List API](https://developers.google.com/my-business/reference/rest/v4/accounts.locations/list)
7. **Enter your account name** in the "parent" field
8. **Execute** - this will show your location ID

#### Option B: I'll Help You Find It
Once you give me the API credentials, I can create a simple tool to find your location ID automatically.

## What You Need to Provide Me:

### Required Information:
1. **API Key**: From Step 3
2. **OAuth 2.0 Client ID**: From Step 5
3. **OAuth 2.0 Client Secret**: From Step 5
4. **Business Location ID**: From Step 6 (or I can help find it)

### Optional (for production):
5. **Your production domain** (e.g., autoworkx.com) - to add to authorized origins

## Security Note:
- **Never share** these credentials publicly
- **Keep API keys** in environment variables
- **Use HTTPS** in production

## Next Steps:
1. Complete steps 1-5 above
2. Provide me with the credentials
3. I'll create the integration code
4. I'll help you find your Location ID if needed
5. Test the reviews display
6. Deploy to production

## Estimated Time:
- **Your part**: 15-20 minutes
- **My part**: 30-45 minutes to code the integration

Ready to start? Begin with Step 1 and let me know when you have the credentials!