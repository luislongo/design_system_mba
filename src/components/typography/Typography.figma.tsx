import figma from "@figma/code-connect";
import { H1, H2, H3, Subtitle, Body, Description } from "./Typography";

figma.connect(
  H1,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=328-653",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <H1>{children}</H1>,
  }
);

figma.connect(
  H2,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=328-654",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <H2>{children}</H2>,
  }
);

figma.connect(
  H3,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=328-655",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <H3>{children}</H3>,
  }
);

figma.connect(
  Subtitle,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=329-729",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <Subtitle>{children}</Subtitle>,
  }
);

figma.connect(
  Body,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=329-735",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <Body>{children}</Body>,
  }
);

figma.connect(
  Description,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=337-280",
  {
    props: { children: figma.string("children") },
    example: ({ children }) => <Description>{children}</Description>,
  }
);
