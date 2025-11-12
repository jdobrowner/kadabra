# Design Tokens

This project uses **Reshaped's theme system** for all design token customization.

## Quick Start

1. **Edit `reshaped.config.js`** at the project root to customize tokens
2. **Run `npm run build:themes`** to generate theme files
3. **Import theme** in your app: `import './themes/kadabra/theme.css'`

## Files

- **`RESHAPED_TOKENS_REFERENCE.md`** - Complete reference of all configurable Reshaped design tokens
- **`README.md`** - This file

## Configuration

All theme customization happens in `reshaped.config.js` at the project root. Only override the tokens you want to change - Reshaped will use defaults for the rest.

Example:

```javascript
// reshaped.config.js
const config = {
  themes: {
    kadabra: {
      color: {
        foregroundPrimary: { hex: "#0176d3", hexDark: "#5aa3f0" },
        backgroundPrimary: { hex: "#0176d3", hexDark: "#1e4a72" },
      },
      fontFamily: {
        body: { family: "'Inter', sans-serif" }
      }
    }
  }
}
```

## Generated Themes

After running `npm run build:themes`, theme files are generated in:
- `src/themes/kadabra/theme.css` - Main theme CSS
- `src/themes/kadabra/theme.json` - Token values as JSON

## Usage in Components

Reshaped components automatically use your theme:

```tsx
import { Reshaped } from 'reshaped'
import './themes/kadabra/theme.css'

<Reshaped theme="kadabra">
  <Button>Styled with your theme</Button>
</Reshaped>
```

## Reference

See **`RESHAPED_TOKENS_REFERENCE.md`** for a complete list of all configurable tokens:
- Color tokens (foreground, background, border)
- Typography tokens (fonts, weights, sizes)
- Spacing tokens
- Border radius tokens
- Shadow tokens
- Viewport tokens
- Theme options

## Resources

- [Reshaped Theming Documentation](https://reshaped.so/docs/tokens/theming/creating-themes)
- [Reshaped Design Tokens Overview](https://reshaped.so/docs/tokens/overview)
