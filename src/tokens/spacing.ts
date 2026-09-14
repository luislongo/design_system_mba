/** Raw Figma size primitives — token key maps to scale name, value in px */
export const sizePrimitives: Record<string, string> = {
  "0": "0px",
  "050": "2px",
  "100": "4px",
  "150": "6px",
  "200": "8px",
  "250": "10px",
  "300": "12px",
  "400": "16px",
  "600": "24px",
  "800": "32px",
  "1000": "40px",
  "1200": "48px",
  "1600": "64px",
  "2400": "96px",
  "4000": "160px",
};

/** Tailwind spacing — reuses the same scale */
export const spacing: Record<string, string> = sizePrimitives;

/** Semantic border-radius tokens */
export const borderRadius: Record<string, string> = {
  "100": sizePrimitives["100"],
  "200": sizePrimitives["200"],
  "400": sizePrimitives["400"],
  full: "9999px",
};
