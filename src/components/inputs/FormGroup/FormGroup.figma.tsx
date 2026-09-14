import figma from "@figma/code-connect";
import { FormGroup } from "./FormGroup";
import { Textbox } from "../Textbox";

figma.connect(
  FormGroup,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=281-934",
  {
    props: {
      label: figma.string("Label"),
      error: figma.enum("State", {
        Error: "Campo inválido",
      }),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ label, error, disabled }) => (
      <FormGroup label={label} error={error} disabled={disabled}>
        <Textbox hasError={!!error} disabled={disabled} placeholder="Placeholder..." />
      </FormGroup>
    ),
  }
);

// FormLabel sub-component — rendered internally by FormGroup via the label prop
figma.connect(
  FormGroup,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=279-885",
  {
    props: {
      label: figma.string("Label"),
      disabled: figma.enum("State", {
        Disabled: true,
      }),
    },
    example: ({ label, disabled }) => (
      <FormGroup label={label} disabled={disabled}>
        <Textbox disabled={disabled} placeholder="Placeholder..." />
      </FormGroup>
    ),
  }
);

// FormError sub-component — rendered internally by FormGroup via the error prop
figma.connect(
  FormGroup,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=281-896",
  {
    props: {},
    example: () => (
      <FormGroup label="Campo" error="Campo inválido">
        <Textbox hasError placeholder="Placeholder..." />
      </FormGroup>
    ),
  }
);
