// @ts-check
/** @type {import('reshaped').ReshapedConfig} */
const config = {
  themes: {
    kadabra: {
      // Customize Reshaped's semantic tokens
      color: {
        // Brand colors - override Reshaped's primary colors (black primary for buttons)
        foregroundPrimary: { hex: "#ffffff", hexDark: "#ffffff" }, // White text on black buttons
        borderPrimary: { hex: "#000000", hexDark: "#ffffff" },
        backgroundPrimary: { hex: "#000000", hexDark: "#ffffff" }, // Black primary buttons
        backgroundPrimaryFaded: { hex: "#f5f5f5", hexDark: "#2d2d2d" },
        
        // Semantic colors (lower contrast dark mode)
        foregroundPositive: { hex: "#04844b", hexDark: "#7dd4a5" },
        backgroundPositive: { hex: "#04844b", hexDark: "#03683a" },
        backgroundPositiveFaded: { hex: "#d4edda", hexDark: "#1a4d2e" },
        
        foregroundCritical: { hex: "#ea001e", hexDark: "#ff8899" },
        backgroundCritical: { hex: "#ea001e", hexDark: "#c8102e" },
        backgroundCriticalFaded: { hex: "#f8d7da", hexDark: "#5a1a20" },
        
        // Neutral colors - lower contrast dark mode
        foregroundNeutral: { hex: "#080707", hexDark: "#eaeaea" },
        foregroundNeutralFaded: { hex: "#706e6b", hexDark: "#b5b5b5" },
        backgroundNeutral: { hex: "#ffffff", hexDark: "#1a1a1a" },
        backgroundNeutralFaded: { hex: "#f8f9fa", hexDark: "#2d2d2d" },
        // Card backgrounds - blend of page background (60%) and header background (40%)
        // Light: 60% #ffffff + 40% #fafafa ≈ #fdfdfd (rgb(253, 253, 253))
        // Dark: 60% #141414 + 40% #1a1919 ≈ #161616 (rgb(22, 22, 22))
        backgroundBase: { hex: "#fdfdfd", hexDark: "#161616" },
        backgroundElevationBase: { hex: "#fdfdfd", hexDark: "#161616" },
        backgroundElevationRaised: { hex: "#fdfdfd", hexDark: "#161616" },
        // Main content area background - dark grey in dark mode
        backgroundPage: { hex: "#ffffff", hexDark: "#141414" },
      },
      
      // Typography - customize font families
      fontFamily: {
        body: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        title: {
          family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }
      },
      
      // Typography - customize font sizes and weights for better card typography
      font: {
        // Heading sizes - smaller typography
        title1: {
          fontSize: { px: 28 },
          lineHeight: { px: 34 },
          fontWeightToken: "bold",
          fontFamilyToken: "title"
        },
        title2: {
          fontSize: { px: 24 },
          lineHeight: { px: 29 },
          fontWeightToken: "bold",
          fontFamilyToken: "title"
        },
        title3: {
          fontSize: { px: 22 },
          lineHeight: { px: 26 },
          fontWeightToken: "semibold",
          fontFamilyToken: "title"
        },
        title4: {
          fontSize: { px: 20 },
          lineHeight: { px: 24 },
          fontWeightToken: "semibold",
          fontFamilyToken: "title"
        },
        // Title-5 - card title size (16px semibold)
        title5: {
          fontSize: { px: 16 },
          lineHeight: { px: 19 },
          fontWeightToken: "semibold",
          fontFamilyToken: "body"
        },
        // Title-6 - smaller card title (14px semibold for compact cards)
        title6: {
          fontSize: { px: 14 },
          lineHeight: { px: 18 },
          fontWeightToken: "semibold",
          fontFamilyToken: "body"
        },
        // Keep body2 regular weight for body text, can use weight="semibold" prop for labels
        body2: {
          fontSize: { px: 14 },
          lineHeight: { px: 20 },
          fontWeightToken: "regular",
          fontFamilyToken: "body"
        },
      },
      
      // Spacing unit - controls overall UI density
      unit: {
        base: { px: 4 }
      },
      
      // Border radius - pill-shaped buttons
      radius: {
        small: { px: 4 },
        medium: { px: 6 },
        large: { px: 999 } // Pill-shaped buttons
      },
    },
  },
};

export default config;

