import figma from "@figma/code-connect";
import { NavbarTab } from "./NavbarTab";

figma.connect(
  NavbarTab,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=127-435",
  {
    props: {
      label: figma.string("Label"),
      icon: figma.instance("Icon"),
      active: figma.enum("Active", {
        True: true,
        False: false,
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ label, icon, active, disabled }) => (
      <NavbarTab label={label} icon={icon} active={active} disabled={disabled} />
    ),
  }
);
