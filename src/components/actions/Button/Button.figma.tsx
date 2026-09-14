import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(
  Button,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=46-117",
  {
    props: {
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
        Tertiary: "tertiary",
      }),
      size: figma.enum("Size", {
        Small: "sm",
        Medium: "md",
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
      startIcon: figma.boolean("HasStartIcon", {
        true: figma.instance("StartIcon"),
        false: undefined,
      }),
      trailingIcon: figma.boolean("HasTrailingIcon", {
        true: figma.instance("TrailingIcon"),
        false: undefined,
      }),
      children: figma.string("Label"),
    },
    example: ({ variant, size, disabled, startIcon, trailingIcon, children }) => (
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        startIcon={startIcon}
        trailingIcon={trailingIcon}
      >
        {children}
      </Button>
    ),
  }
);
