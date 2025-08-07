# Google Reviews Integration Guide

## Current Status
Your website now has a placeholder for live Google reviews. Here are the options to display real Google reviews:

## Option 1: EmbedSocial (Recommended)
- **Cost**: Paid service ($29/month)
- **Features**: Live sync with Google, customizable design
- **Setup**: 
  1. Sign up at embedsocial.com
  2. Connect your Google My Business
  3. Get embed code
  4. Replace the placeholder in the reviews section

## Option 2: Elfsight Google Reviews Widget
- **Cost**: Paid service ($5.95/month)
- **Features**: Easy setup, various layouts
- **Setup**:
  1. Visit apps.elfsight.com
  2. Create Google Reviews widget
  3. Customize design to match your site
  4. Get embed code

## Option 3: Reviews.co.uk
- **Cost**: Various plans available
- **Features**: Comprehensive review management
- **Good for**: UK-based businesses

## Option 4: Custom Google My Business API
- **Cost**: Free (development time required)
- **Complexity**: High - requires developer
- **Features**: Full control over display and data

## Implementation Instructions
Once you choose a service:

1. **Get your embed code** from the service provider
2. **Replace the placeholder** in `src/App.tsx` around line 236
3. **Remove the current placeholder content** and add your widget

Example replacement:
```jsx
{/* Replace this entire div with your widget embed code */}
<div className="bg-white/5 rounded-2xl p-8 border border-white/10">
  {/* Your Google Reviews Widget Code Here */}
</div>
```

## Current Google Link
The "View Google Reviews" button currently links to a Google search for "AutoworkX Coburg North reviews". Update this URL to your actual Google My Business reviews page.

## Need Help?
If you need assistance with the integration, I can help you implement whichever option you choose!