export const fontFamily: Record<string, string[]> = {
  sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
};

export const fontSize: Record<string, [string, { lineHeight: string }]> = {
  xs: ["12px", { lineHeight: "16px" }],
  sm: ["14px", { lineHeight: "20px" }],
  base: ["16px", { lineHeight: "24px" }],
  lg: ["18px", { lineHeight: "28px" }],
  xl: ["20px", { lineHeight: "28px" }],
  "2xl": ["24px", { lineHeight: "32px" }],
  "3xl": ["30px", { lineHeight: "36px" }],
};

export const fontWeight: Record<string, string> = {
  base: "400",
  medium: "500",
  semibold: "600",
};
