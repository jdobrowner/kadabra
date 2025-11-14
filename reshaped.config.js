// @ts-check
/** @type {import('reshaped').ReshapedConfig} */
const config = {
  themes: {
    kadabra: {
      // Customize Reshaped's semantic tokens
      color: {
        // Brand colors - override Reshaped's primary colors (dark gray primary for buttons)
        foregroundPrimary: { hex: "#f8f3f7", hexDark: "#f8f3f7" }, // Soft white text on dark buttons
        borderPrimary: { hex: "#1c1c1c", hexDark: "#ffffff" },
        backgroundPrimary: { hex: "#1c1c1c", hexDark: "#ffffff" }, // Dark gray primary buttons
        backgroundPrimaryFaded: { hex: "#f5f5f5", hexDark: "#2d2d2d" },
        
        // Semantic colors (lower contrast dark mode)
        foregroundPositive: { hex: "#04844b", hexDark: "#7dd4a5" },
        backgroundPositive: { hex: "#04844b", hexDark: "#03683a" },
        backgroundPositiveFaded: { hex: "#d4edda", hexDark: "#1a4d2e" },
        
        foregroundCritical: { hex: "#ea001e", hexDark: "#ff8899" },
        backgroundCritical: { hex: "#ea001e", hexDark: "#c8102e" },
        backgroundCriticalFaded: { hex: "#f8d7da", hexDark: "#5a1a20" },
        
        // Neutral colors - primary and secondary text colors
        foregroundNeutral: { hex: "#161515", hexDark: "#d8d4d4" }, // Primary text color
        foregroundNeutralFaded: { hex: "#706e6b", hexDark: "#b5b5b5" }, // Secondary text color
        backgroundNeutral: { hex: "#fffdfe", hexDark: "#1c1c1c" }, // Card backgrounds - matches Dashboard cards
        backgroundNeutralFaded: { hex: "#f8f9fa", hexDark: "#2d2d2d" },
        // Border colors - custom card borders
        borderNeutral: { hex: "#f6f1f1", hexDark: "#141414" }, // Card border color
        borderNeutralFaded: { hex: "rgba(22, 21, 21, 0.05)", hexDark: "rgba(255, 255, 255, 0.1)" }, // Row card border color
        // Card backgrounds - using #fffdfe instead of pure white
        backgroundBase: { hex: "#fffdfe", hexDark: "#1c1c1c" },
        backgroundElevationBase: { hex: "#fffdfe", hexDark: "#1c1c1c" },
        backgroundElevationRaised: { hex: "#fffdfe", hexDark: "#1c1c1c" },
        backgroundElevationOverlay: { hex: "#fffdfe", hexDark: "#1c1c1c" },
        // Main content area background - app background color
        backgroundPage: { hex: "#f8f3f7", hexDark: "#161515" },
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
      
      // Border radius - rounded corners
      radius: {
        small: { px: 4 },
        medium: { px: 30 }, // Rounded corners for buttons and cards
        large: { px: 30 } // Rounded corners
      },
      
      // Shadow configuration - use dark gray instead of pure black
      shadow: {
        raised: [
          {
            offsetX: 0,
            offsetY: 1,
            blurRadius: 5,
            spreadRadius: -4,
            colorToken: "black",
            opacity: 0.5
          },
          {
            offsetX: 0,
            offsetY: 4,
            blurRadius: 8,
            colorToken: "black",
            opacity: 0.05
          }
        ],
        overlay: [
          {
            offsetX: 0,
            offsetY: 5,
            blurRadius: 10,
            colorToken: "black",
            opacity: 0.05
          },
          {
            offsetX: 0,
            offsetY: 15,
            blurRadius: 25,
            colorToken: "black",
            opacity: 0.07
          }
        ]
      },
    },
  },
};

export default config;

