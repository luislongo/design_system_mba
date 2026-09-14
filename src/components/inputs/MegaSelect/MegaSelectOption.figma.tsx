import figma from "@figma/code-connect";
import { MegaSelectOption } from "./MegaSelectOption";

figma.connect(
  MegaSelectOption,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=154-478",
  {
    props: {
      label: figma.string("Label"),
    },
    example: ({ label }) => (
      <MegaSelectOption value="option" label={label} />
    ),
  }
);
