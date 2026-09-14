import figma from "@figma/code-connect";
import { ProgressChip } from "./ProgressChip";

figma.connect(
  ProgressChip,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=457-78",
  {
    props: {
      value: figma.string("Value"),
      color: figma.enum("Color", {
        Blue: "blue",
        Green: "green",
        Purple: "purple",
        Orange: "orange",
      }),
    },
    example: ({ value, color }) => <ProgressChip value={value} color={color} />,
  }
);
