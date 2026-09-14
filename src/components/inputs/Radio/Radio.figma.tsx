import figma from "@figma/code-connect";
import { Radio } from "./Radio";

figma.connect(
  Radio,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=336-204",
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
      <Radio defaultChecked={defaultChecked} disabled={disabled} />
    ),
  }
);
