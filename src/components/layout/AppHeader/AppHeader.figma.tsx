import figma from "@figma/code-connect";
import { AppHeader, AppHeaderLeft, AppHeaderRight } from "./AppHeader";
import { IconLocalLibrary } from "../../icons/IconLocalLibrary";

figma.connect(
  AppHeader,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=382-210",
  {
    example: () => (
      <AppHeader
        size="desktop"
        title="Título"
        icon={<IconLocalLibrary />}
        avatar={<img className="size-1200 rounded-full object-cover" alt="Avatar" src="" />}
      />
    ),
  }
);

figma.connect(
  AppHeaderLeft,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=376-54",
  {
    example: () => <AppHeaderLeft icon={<IconLocalLibrary />} title="Título" />,
  }
);

figma.connect(
  AppHeaderRight,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=376-71",
  {
    example: () => (
      <AppHeaderRight
        avatar={<img className="size-1200 rounded-full object-cover" alt="Avatar" src="" />}
      />
    ),
  }
);
