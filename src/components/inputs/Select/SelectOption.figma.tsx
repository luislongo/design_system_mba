import figma from "@figma/code-connect";
import { SelectOption } from "./SelectOption";

figma.connect(
  SelectOption,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=281-972",
  {
    props: {
      label: figma.string("Label"),
    },
    example: ({ label }) => (
      <SelectOption value="option" label={label} />
    ),
  }
);
