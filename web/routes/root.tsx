import { Container } from "@chakra-ui/react";
import { useRouteNode } from "react-router5";

import { useCallback } from "react";
import Navbar from "../components/navbar/navbar";
import Home from "./home";
import Level from "./level";
import Journal from "./journal";
import DialogOverBg from "./dialog_over_bg";
import DemoLevel from "./demo_level";
import End from "./end";

export default function Root() {
  const { route } = useRouteNode("");

  if (!route) {
    throw new Error("Route is undefined");
  }

  const currPage = useCallback(() => {
    if (route.name === "home") {
      return <Home />;
    }
    if (route.name === "level") {
      return <Level />;
    }
    if (route.name === "dialog") {
      return <DialogOverBg />;
    }
    if (route.name === "journal_section") {
      return <Journal />;
    }
    if (route.name === "demo_level") {
      return <DemoLevel />;
    }
    if (route.name === "end") {
      return <End />;
    }
    throw new Error(`Unknown route: ${route.name}`);
  }, [route]);

  return (
    <Container minW="container.md" maxW="none" p={0}>
      <Navbar />
      {currPage()}
    </Container>
  );
}
