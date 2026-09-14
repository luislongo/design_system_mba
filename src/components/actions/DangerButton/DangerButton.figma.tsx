import figma from "@figma/code-connect";
import { DangerButton } from "./DangerButton";

figma.connect(
  DangerButton,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=82-981",
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
      <DangerButton
        variant={variant}
        size={size}
        disabled={disabled}
        startIcon={startIcon}
        trailingIcon={trailingIcon}
      >
        {children}
      </DangerButton>
    ),
  }
);
