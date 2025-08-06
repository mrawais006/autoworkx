# AutoworkX Logo Integration Instructions

## How to Replace the Logo Placeholder

Your website currently displays a text-based logo placeholder. When you're ready to add your actual logo, follow these simple steps:

### Step 1: Add Your Logo File
1. Place your logo file (PNG, SVG, or JPG) in the `src/assets/` folder (create this folder if it doesn't exist)
2. Recommended formats:
   - **SVG**: Best for scalability and small file size
   - **PNG**: Good for complex logos with transparency
   - Recommended size: 400px wide minimum for high-resolution displays

### Step 2: Update the Logo Component
Open the file `src/components/Logo.tsx` and replace the placeholder content:

**Replace this:**
```tsx
<div className="text-center">
  <h1 className="text-5xl md:text-7xl font-display font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
    AutoworkX
  </h1>
  {showPlaceholder && (
    <div className="text-xs text-white/60 mt-2 font-light tracking-widest uppercase">
      Replace with your logo
    </div>
  )}
</div>
```

**With this:**
```tsx
<img 
  src="/src/assets/your-logo-filename.png" 
  alt="AutoworkX Logo" 
  className="h-20 md:h-32 w-auto object-contain"
/>
```

### Step 3: Adjust the Logo Size (if needed)
You can customize the logo size by modifying the className:
- `h-16` = 64px height (small)
- `h-20` = 80px height (medium)
- `h-32` = 128px height (large)
- `h-40` = 160px height (extra large)

### Step 4: Build and Test
Run the following commands to rebuild your website:
```bash
npm run build
npm run dev
```

## Need Help?
If you need assistance with logo integration, feel free to ask!

## Current Logo Location
The logo appears in:
- **Hero section**: Main prominent display
- **Footer**: Smaller version (automatically inherits the same logo)

The glassmorphic container will automatically adapt to your logo dimensions while maintaining the beautiful glass effect.