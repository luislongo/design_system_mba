import figma from "@figma/code-connect";
import { Tab } from "./Tab";

figma.connect(
  Tab,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=122-595",
  {
    props: {
      label: figma.string("Label"),
      active: figma.enum("Active", {
        True: true,
        False: false,
      }),
      size: figma.enum("Size", {
        Default: "Default",
        Large: "Large",
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ label, active, size, disabled }) => (
      <Tab label={label} active={active} size={size} disabled={disabled} />
    ),
  }
);
