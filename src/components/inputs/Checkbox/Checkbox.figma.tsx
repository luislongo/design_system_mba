import figma from "@figma/code-connect";
import { Checkbox } from "./Checkbox";

figma.connect(
  Checkbox,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=335-182",
  {
    props: {
      defaultChecked: figma.enum("Checked", {
        True: true,
        False: false,
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ defaultChecked, disabled }) => (
      <Checkbox defaultChecked={defaultChecked} disabled={disabled} />
    ),
  }
);
