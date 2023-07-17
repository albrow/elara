import { useRouteNode } from "react-router5";

import { useCallback } from "react";
import Navbar from "../components/navbar/navbar";
import About from "./about";
import Hub from "./hub";
import Level from "./level";
import Journal from "./journal";
import DialogOverBg from "./dialog_over_bg";
import End from "./end";

import "../styles/scrollbars.css";

export default function Root() {
  const { route } = useRouteNode("");

  if (!route) {
    throw new Error("Route is undefined");
  }

  const currPage = useCallback(() => {
    if (route.name === "about") {
      return <About />;
    }
    if (route.name === "hub") {
      return <Hub />;
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
    if (route.name === "end") {
      return <End />;
    }
    throw new Error(`Unknown route: ${route.name}`);
  }, [route]);

  return (
    <>
      <Navbar />
      {currPage()}
    </>
  );
}
