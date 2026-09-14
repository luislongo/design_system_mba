import figma from "@figma/code-connect";
import { HeroButton } from "./HeroButton";

figma.connect(
  HeroButton,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=87-1248",
  {
    props: {
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
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
    example: ({ variant, disabled, startIcon, trailingIcon, children }) => (
      <HeroButton
        variant={variant}
        disabled={disabled}
        startIcon={startIcon}
        trailingIcon={trailingIcon}
      >
        {children}
      </HeroButton>
    ),
  }
);
