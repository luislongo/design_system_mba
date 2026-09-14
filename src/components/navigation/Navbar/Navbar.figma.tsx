import figma from "@figma/code-connect";
import { Navbar } from "./Navbar";
import { NavbarTab } from "./NavbarTab";
import { IconHome } from "../../icons/IconHome";

figma.connect(
  Navbar,
  "https://www.figma.com/design/s3BAU9djJ4fZWidxHbeMaB/Plataforma-Visus?node-id=522-11504",
  {
    props: {
      size: figma.enum("Size", {
        Desktop: "desktop",
        Mobile: "mobile",
      }),
    },
    example: ({ size }) => (
      <Navbar size={size}>
        <NavbarTab label="Aba" icon={<IconHome />} size={size} active />
      </Navbar>
    ),
  }
);
