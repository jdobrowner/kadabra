# Generated Theme Files

This directory contains **auto-generated** theme files created by Reshaped's theming CLI.

**⚠️ Do not edit these files manually** - they are regenerated from `reshaped.config.js` whenever you run `npm run build:themes`.

## Generated Files

- **`theme.css`** - Main theme CSS with Reshaped design tokens (used in your app)
- **`theme.json`** - Theme tokens as JSON
- **`tailwind.css`** - Tailwind v4 theme integration (only needed if using Tailwind CSS)
- **`media.css`** - Custom media queries for viewport tokens

## Usage

Import the main theme CSS in your app:

```tsx
import './themes/kadabra/theme.css'
```

The `tailwind.css` file is only needed if you're using Tailwind CSS v4 with Reshaped. Since Tailwind is not currently installed in this project, you can safely ignore this file.

## Regenerating Themes

After editing `reshaped.config.js`:

```bash
npm run build:themes
```

This will regenerate all theme files in this directory.

