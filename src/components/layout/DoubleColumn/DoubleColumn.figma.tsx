import figma from "@figma/code-connect";
import { DoubleColumn } from "./DoubleColumn";

figma.connect(
  DoubleColumn,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=393-663",
  {
    props: {
      size: figma.enum("Size", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
      slotLeft: figma.instance("SlotLeft"),
      slotRight: figma.instance("SlotRight"),
    },
    example: ({ size, slotLeft, slotRight }) => (
      <DoubleColumn size={size} slotLeft={slotLeft} slotRight={slotRight} />
    ),
  }
);
