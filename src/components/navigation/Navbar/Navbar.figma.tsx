import figma from "@figma/code-connect";
import { Navbar } from "./Navbar";

figma.connect(
  Navbar,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=261-808",
  {
    props: {
      children: figma.children("*"),
    },
    example: ({ children }) => <Navbar>{children}</Navbar>,
  }
);
