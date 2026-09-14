import figma from "@figma/code-connect";
import { AppHeader, AppHeaderLeft, AppHeaderRight } from "./AppHeader";
import { IconLocalLibrary } from "../../icons/IconLocalLibrary";

figma.connect(
  AppHeader,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=382-210",
  {
    props: {
      size: figma.enum("Size", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
      navbar: figma.children("Content"),
    },
    example: ({ size, navbar }) => (
      <AppHeader
        size={size}
        title="Título"
        icon={<IconLocalLibrary />}
        navbar={navbar}
        avatar={<img className="size-full rounded-full object-cover" alt="Avatar" src="" />}
      />
    ),
  }
);

figma.connect(
  AppHeaderLeft,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=522-11641",
  {
    props: {
      size: figma.enum("Size", {
        "Padrão": "desktop",
        Mobile: "mobile",
      }),
      icon: figma.instance("Instância"),
    },
    example: ({ size, icon }) => (
      <AppHeaderLeft icon={icon} title="Título" size={size} />
    ),
  }
);

figma.connect(
  AppHeaderRight,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=522-11648",
  {
    props: {
      size: figma.enum("Size", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
    },
    example: ({ size }) => (
      <AppHeaderRight
        size={size}
        avatar={<img className="size-full rounded-full object-cover" alt="Avatar" src="" />}
      />
    ),
  }
);
