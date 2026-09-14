import figma from "@figma/code-connect";
import { TabList } from "./TabList";

figma.connect(
  TabList,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=259-672",
  {
    props: {
      size: figma.enum("Size", {
        Default: "Default",
        Large: "Large",
      }),
      children: figma.children("*"),
    },
    example: ({ size, children }) => <TabList size={size}>{children}</TabList>,
  }
);
