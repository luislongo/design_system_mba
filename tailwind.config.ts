import type { Config } from "tailwindcss";
import { colors, fontFamily, fontSize, fontWeight, spacing, borderRadius } from "./src/tokens";
// tokens: card, table, dataviz, spacing-250

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
      fontWeight,
      spacing,
      borderRadius,
    },
  },
  plugins: [],
} satisfies Config;
