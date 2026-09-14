import figma from "@figma/code-connect";
import { ProgressBar } from "./ProgressBar";

figma.connect(
  ProgressBar,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=457-69",
  {
    props: {
      color: figma.enum("Color", {
        Blue: "blue",
        Green: "green",
        Purple: "purple",
        Orange: "orange",
      }),
    },
    example: ({ color }) => <ProgressBar value={60} color={color} />,
  }
);
