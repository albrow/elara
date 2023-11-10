import { useRouteNode } from "react-router5";
import { useCallback, useMemo } from "react";

import Navbar from "../components/settings/navbar/navbar";
import SizingUtility from "../components/sizing_utility";
import Cutscene from "./cutscene";
import Title from "./title";
import Loading from "./loading";
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
    if (route.name === "loading") {
      return <Loading destination={route.params.destination} />;
    }
    if (route.name === "title") {
      return <Title />;
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
    if (route.name === "cutscene") {
      return <Cutscene cutsceneId={route.params.cutsceneId} />;
    }
    throw new Error(`Unknown route: ${route.name}`);
  }, [route.name, route.params.cutsceneId, route.params.destination]);

  const shouldShowNavbar = useMemo(
    () =>
      ["hub", "level", "dialog", "journal_section", "end"].includes(route.name),
    [route.name]
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {/* Show sizing utility in dev mode only */}
      {process.env.NODE_ENV === "development" && <SizingUtility />}
      {currPage()}
    </>
  );
}
