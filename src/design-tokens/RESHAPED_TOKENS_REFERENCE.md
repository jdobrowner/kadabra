# Reshaped Design Tokens Reference

Complete reference of all configurable design tokens in Reshaped. Customize these tokens in `reshaped.config.js` at the project root.

## Overview

Reshaped uses semantic design tokens that automatically generate additional derived tokens. When you customize a token in `reshaped.config.js`, Reshaped generates all related tokens (like `onBackground` colors) automatically.

**Documentation**: [Reshaped Theming Guide](https://reshaped.so/docs/tokens/theming/creating-themes)

## How to Use

1. Edit `reshaped.config.js` at the project root
2. Add token values to your theme (only override what you want to change)
3. Run `npm run build:themes` to generate theme files
4. Import and use: `import './themes/kadabra/theme.css'`

---

## Color Tokens

All color tokens support both light and dark mode via `hex` and `hexDark` properties. `hexDark` is optional if not using dark mode.

### Foreground Colors (Text)

```javascript
color: {
  foregroundNeutral: { hex: "#000", hexDark: "#fff" },
  foregroundNeutralFaded: { hex: "#666", hexDark: "#999" },
  foregroundDisabled: { hex: "#ccc", hexDark: "#555" },
  foregroundPrimary: { hex: "#0176d3", hexDark: "#5aa3f0" },
  foregroundCritical: { hex: "#ea001e", hexDark: "#ff6b7d" },
  foregroundPositive: { hex: "#04844b", hexDark: "#6bc997" },
}
```

### Background Colors

```javascript
color: {
  backgroundNeutral: { hex: "#fff", hexDark: "#1a1a1a" },
  backgroundNeutralFaded: { hex: "#f8f9fa", hexDark: "#2d2d2d" },
  backgroundDisabled: { hex: "#f0f0f0", hexDark: "#333" },
  backgroundDisabledFaded: { hex: "#e0e0e0", hexDark: "#444" },
  backgroundPrimary: { hex: "#0176d3", hexDark: "#1e4a72" },
  backgroundPrimaryFaded: { hex: "#e5f3ff", hexDark: "#0d2a40" },
  backgroundCritical: { hex: "#ea001e", hexDark: "#c8102e" },
  backgroundCriticalFaded: { hex: "#f8d7da", hexDark: "#5a1a20" },
  backgroundPositive: { hex: "#04844b", hexDark: "#03683a" },
  backgroundPositiveFaded: { hex: "#d4edda", hexDark: "#1a4d2e" },
}
```

### Border Colors

```javascript
color: {
  borderNeutral: { hex: "#ccc", hexDark: "#555" },
  borderNeutralFaded: { hex: "#e0e0e0", hexDark: "#444" },
  borderDisabled: { hex: "#f0f0f0", hexDark: "#333" },
  borderPrimary: { hex: "#0176d3", hexDark: "#5aa3f0" },
  borderPrimaryFaded: { hex: "#b3d9f2", hexDark: "#2d5a80" },
  borderCritical: { hex: "#ea001e", hexDark: "#ff6b7d" },
  borderCriticalFaded: { hex: "#f4a5b0", hexDark: "#8b2a36" },
  borderPositive: { hex: "#04844b", hexDark: "#6bc997" },
  borderPositiveFaded: { hex: "#a8e6c4", hexDark: "#2d6b4a" },
}
```

### Page Background Colors

```javascript
color: {
  backgroundPage: { hex: "#fff", hexDark: "#000" },
  backgroundPageFaded: { hex: "#f8f9fa", hexDark: "#1a1a1a" },
}
```

### Elevation Backgrounds

```javascript
color: {
  backgroundElevationBase: { hex: "#fff", hexDark: "#1a1a1a" },
  backgroundElevationRaised: { hex: "#fff", hexDark: "#2d2d2d" },
  backgroundElevationOverlay: { hex: "#fff", hexDark: "#2d2d2d" },
}
```

### Base Colors

```javascript
color: {
  black: { hex: "#000", hexDark: "#000" },  // Should stay black in both modes
  white: { hex: "#fff", hexDark: "#fff" },  // Should stay white in both modes
}
```

**Note**: All `onBackground*` color tokens (e.g., `onBackgroundPrimary`) are automatically generated based on contrast ratios.

---

## Typography Tokens

### Font Families

```javascript
fontFamily: {
  body: {
    family: "'Inter', sans-serif"
  },
  title: {
    family: "'Inter', sans-serif"
  }
}
```

### Font Weights

```javascript
fontWeight: {
  regular: { weight: 400 },
  medium: { weight: 500 },
  semibold: { weight: 600 },
  bold: { weight: 700 },
  extrabold: { weight: 800 },
  black: { weight: 900 },
}
```

### Font Definitions

Each font token combines size, line height, letter spacing, weight, and family:

```javascript
font: {
  title1: {
    fontSize: { px: 48 },
    lineHeight: { px: 52 },
    letterSpacing: { px: 0 },  // Optional, defaults to normal
    fontWeightToken: "extrabold",
    fontFamilyToken: "title"
  },
  title2: {
    fontSize: { px: 40 },
    lineHeight: { px: 44 },
    fontWeightToken: "extrabold",
    fontFamilyToken: "title"
  },
  title3: {
    fontSize: { px: 32 },
    lineHeight: { px: 36 },
    fontWeightToken: "extrabold",
    fontFamilyToken: "title"
  },
  title4: {
    fontSize: { px: 28 },
    lineHeight: { px: 32 },
    fontWeightToken: "bold",
    fontFamilyToken: "title"
  },
  title5: {
    fontSize: { px: 24 },
    lineHeight: { px: 28 },
    fontWeightToken: "bold",
    fontFamilyToken: "title"
  },
  title6: {
    fontSize: { px: 20 },
    lineHeight: { px: 24 },
    fontWeightToken: "bold",
    fontFamilyToken: "title"
  },
  
  featured1: {
    fontSize: { px: 18 },
    lineHeight: { px: 24 },
    fontWeightToken: "bold",
    fontFamilyToken: "body"
  },
  featured2: {
    fontSize: { px: 16 },
    lineHeight: { px: 22 },
    fontWeightToken: "semibold",
    fontFamilyToken: "body"
  },
  featured3: {
    fontSize: { px: 14 },
    lineHeight: { px: 20 },
    fontWeightToken: "semibold",
    fontFamilyToken: "body"
  },
  
  body1: {
    fontSize: { px: 16 },
    lineHeight: { px: 24 },
    fontWeightToken: "regular",
    fontFamilyToken: "body"
  },
  body2: {
    fontSize: { px: 14 },
    lineHeight: { px: 20 },
    fontWeightToken: "regular",
    fontFamilyToken: "body"
  },
  body3: {
    fontSize: { px: 12 },
    lineHeight: { px: 18 },
    fontWeightToken: "regular",
    fontFamilyToken: "body"
  },
  
  caption1: {
    fontSize: { px: 12 },
    lineHeight: { px: 16 },
    fontWeightToken: "regular",
    fontFamilyToken: "body"
  },
  caption2: {
    fontSize: { px: 10 },
    lineHeight: { px: 14 },
    fontWeightToken: "regular",
    fontFamilyToken: "body"
  },
}
```

---

## Spacing Tokens

### Base Unit

The base unit controls overall UI density. Reshaped automatically generates x1, x2, x3, etc. spacing units based on this value.

```javascript
unit: {
  base: { px: 4 }  // All spacing units are multiples of this (x1=4px, x2=8px, x3=12px, etc.)
}
```

---

## Border Radius Tokens

```javascript
radius: {
  small: { px: 4 },
  medium: { px: 6 },
  large: { px: 8 },
}
```

---

## Shadow Tokens

Shadows use an array format to support multiple shadows on the same element:

```javascript
shadow: {
  raised: [
    {
      offsetX: 0,
      offsetY: 1,
      blurRadius: 3,
      colorToken: "black",  // References a color token name
      opacity: 0.08
    },
    {
      offsetX: 0,
      offsetY: 2,
      blurRadius: 2,
      colorToken: "black",
      opacity: 0.06
    }
  ],
  overlay: [
    {
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      colorToken: "black",
      opacity: 0.12
    },
    {
      offsetX: 0,
      offsetY: 12,
      blurRadius: 16,
      colorToken: "black",
      opacity: 0.08
    }
  ]
}
```

---

## Viewport Tokens (Breakpoints)

Used for responsive design:

```javascript
viewport: {
  m: { minPx: 660 },   // Medium breakpoint
  l: { minPx: 1024 },  // Large breakpoint
  xl: { minPx: 1280 }  // Extra large breakpoint
}
```

**Note**: These require special PostCSS setup. See [Reshaped viewport docs](https://reshaped.so/docs/tokens/viewport).

---

## Theme Options

Additional configuration options:

### Color Contrast Algorithm

```javascript
themeOptions: {
  colorContrastAlgorithm: "wcag"  // or "apca"
}
```

### Color Output Format

```javascript
themeOptions: {
  colorOutputFormat: "oklch"  // or "hex"
}
```

### Generate On- Colors for Custom Tokens

```javascript
themeOptions: {
  generateOnColorsFor: ["backgroundChart", "backgroundCustom"]
}
```

### Override On- Color Values

```javascript
themeOptions: {
  onColorValues: {
    primary: {
      hexLight: "#ffffff",  // Replaces white
      hexDark: "#000000"    // Replaces black
    }
  }
}
```

---

## Example Configuration

See `reshaped.config.js` at the project root for a complete example.

```javascript
// @ts-check
/** @type {import('reshaped').ReshapedConfig} */
const config = {
  themes: {
    kadabra: {
      color: {
        foregroundPrimary: { hex: "#0176d3", hexDark: "#5aa3f0" },
        backgroundPrimary: { hex: "#0176d3", hexDark: "#1e4a72" },
        // ... more colors
      },
      fontFamily: {
        body: { family: "'Inter', sans-serif" },
        title: { family: "'Inter', sans-serif" }
      },
      unit: {
        base: { px: 4 }
      },
      radius: {
        small: { px: 4 },
        medium: { px: 6 },
        large: { px: 8 }
      }
    }
  },
  themeOptions: {
    colorContrastAlgorithm: "wcag",
    colorOutputFormat: "oklch"
  }
}

export default config
```

---

## Custom Tokens

You can add custom tokens beyond Reshaped's defaults:

```javascript
themes: {
  kadabra: {
    color: {
      // Custom token - will be compiled to CSS
      chartTomato: { hex: "#ff6347", hexDark: "#b8412c" },
      backgroundChart: { hex: "#ff6347", hexDark: "#b8412c" },
    }
  },
  themeOptions: {
    // Generate on- colors for custom background
    generateOnColorsFor: ["backgroundChart"]
  }
}
```

---

## Theme Fragments

Create smaller theme subsets for specific components:

```javascript
themeFragments: {
  twitter: {
    color: {
      backgroundPrimary: { hex: "#1da1f2" }
    }
  }
}
```

Use with scoped theming:

```tsx
import { Theme } from 'reshaped'
import './themes/fragments/twitter/theme.css'

<Theme name="twitter">
  <Button>Twitter-styled button</Button>
</Theme>
```

---

## Resources

- [Reshaped Theming Documentation](https://reshaped.so/docs/tokens/theming/creating-themes)
- [Reshaped Design Tokens Overview](https://reshaped.so/docs/tokens/overview)
- [Reshaped Color Tokens](https://reshaped.so/docs/tokens/color)
- [Reshaped Typography Tokens](https://reshaped.so/docs/tokens/typography)

---

## Quick Reference Checklist

✅ **Color tokens**: `foreground*`, `background*`, `border*`  
✅ **Typography**: `fontFamily`, `fontWeight`, `font` (title1-6, featured1-3, body1-3, caption1-2)  
✅ **Spacing**: `unit.base` (generates x1-x10 automatically)  
✅ **Borders**: `radius` (small, medium, large)  
✅ **Shadows**: `shadow` (raised, overlay)  
✅ **Viewports**: `viewport` (m, l, xl)  
✅ **Theme options**: Contrast algorithm, color format, on-colors  

