import figma from "@figma/code-connect";
import { Select } from "./Select";

figma.connect(
  Select,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=281-960",
  {
    props: {
      hasError: figma.enum("State", {
        Error: true,
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ hasError, disabled }) => (
      <Select
        hasError={hasError}
        disabled={disabled}
        options={[
          { value: "1", label: "Option 1" },
          { value: "2", label: "Option 2" },
          { value: "3", label: "Option 3" },
        ]}
      />
    ),
  }
);
