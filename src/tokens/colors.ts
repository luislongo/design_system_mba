export const colorPrimitives = {
  primary: {
    50: "#F3EFF9",
    100: "#D7CBEA",
    200: "#BBA6DC",
    300: "#9F82CE",
    400: "#835DBF",
    500: "#6739B1",
    600: "#542F90",
    700: "#412470",
    800: "#2E1A4F",
    900: "#1B0F2F",
    950: "#08050E",
  },
  neutral: {
    50: "#E0E0E1",
    100: "#C7C8C9",
    200: "#AEAFB2",
    300: "#96969A",
    400: "#7D7E82",
    500: "#64656A",
    600: "#545559",
    700: "#444548",
    800: "#343537",
    900: "#242426",
    950: "#141415",
  },
  light: {
    800: "#F2F2F2",
    900: "#FAFAFA",
    full: "#FFFFFF",
  },
  danger: {
    50: "#FEEDEC",
    100: "#FDDBD8",
    200: "#FCB5B0",
    300: "#FA8C82",
    400: "#FA5B43",
    500: "#DA3E1D",
    600: "#AF3015",
    700: "#86220D",
    800: "#5F1606",
    900: "#3A0A02",
    950: "#280501",
  },
};

export const semanticColors = {
  border: {
    brand: {
      default: colorPrimitives.primary[500],
      hover: colorPrimitives.primary[400],
      disabled: colorPrimitives.neutral[50],
      secondary: colorPrimitives.neutral[200],
      secondaryHover: colorPrimitives.neutral[50],
      secondaryDisabled: colorPrimitives.neutral[50],
      tertiary: "transparent",
    },
    danger: {
      default: colorPrimitives.danger[500],
      hover: colorPrimitives.danger[400],
      disabled: colorPrimitives.danger[50],
      secondary: colorPrimitives.danger[500],
      secondaryHover: colorPrimitives.danger[400],
      secondaryDisabled: colorPrimitives.danger[100],
      tertiary: "transparent",
    },
  },
  background: {
    brand: {
      default: colorPrimitives.primary[500],
      hover: colorPrimitives.primary[400],
      disabled: colorPrimitives.neutral[50],
      secondary: "transparent",
      secondaryHover: colorPrimitives.neutral[50],
      secondaryDisabled: colorPrimitives.neutral[50],
      tertiary: "transparent",
    },
    danger: {
      default: colorPrimitives.danger[500],
      hover: colorPrimitives.danger[400],
      disabled: colorPrimitives.danger[50],
      secondary: "transparent",
      secondaryHover: colorPrimitives.danger[50],
      secondaryDisabled: colorPrimitives.danger[50],
      tertiary: "transparent",
    },
  },
  text: {
    brand: {
      default: colorPrimitives.primary[500],
      secondary: colorPrimitives.primary[400],
      tertiary: colorPrimitives.primary[200],
      onBrand: colorPrimitives.light.full,
      onBrandSecondary: colorPrimitives.neutral[400],
      onBrandTertiary: colorPrimitives.neutral[400],
    },
    danger: {
      default: colorPrimitives.danger[500],
      secondary: colorPrimitives.danger[400],
      tertiary: colorPrimitives.danger[50],
      onDanger: colorPrimitives.light.full,
      onDangerSecondary: colorPrimitives.light.full,
      onDangerTertiary: colorPrimitives.light.full,
    },
    base: {
      default: colorPrimitives.neutral[800],
      secondary: colorPrimitives.neutral[600],
      tertiary: colorPrimitives.neutral[400],
    },
  },
};

/** Flat color map consumed by tailwind.config.ts */
export const colors = {
  primary: colorPrimitives.primary,
  neutral: colorPrimitives.neutral,
  light: colorPrimitives.light,
  danger: colorPrimitives.danger,
  card: {
    title: "#151d48",
    description: "#425166",
    accent: "#4079ed",
  },
  table: {
    border: "#e0e4e9",
  },
};
