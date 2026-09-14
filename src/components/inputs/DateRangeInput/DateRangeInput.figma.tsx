import figma from "@figma/code-connect";
import { DateRangeInput } from "./DateRangeInput";

figma.connect(
  DateRangeInput,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=486-1279",
  {
    props: {},
    example: () => (
      <DateRangeInput
        startLabel="Data Início"
        endLabel="Data Fim"
        startValue="2026-01-01"
        endValue="2026-01-31"
      />
    ),
  }
);
