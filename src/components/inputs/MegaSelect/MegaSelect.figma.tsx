import figma from "@figma/code-connect";
import { MegaSelect } from "./MegaSelect";

figma.connect(
  MegaSelect,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=154-461",
  {
    example: () => (
      <MegaSelect
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
        ]}
      />
    ),
  }
);
