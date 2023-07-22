import { useRouteNode } from "react-router5";
import { useCallback, useEffect, useMemo } from "react";

import Navbar from "../components/settings/navbar/navbar";
import Title from "./title";
import Loading from "./loading";
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

  // Based on https://stackoverflow.com/questions/68842602/react-how-to-detect-page-refresh-and-redirect-user
  // We use different methods to detect a reload in order to account for both older and newer browsers.
  const isReload = useMemo(
    () =>
      (window.performance.navigation &&
        window.performance.navigation.type === 1) ||
      window.performance
        .getEntriesByType("navigation")
        // @ts-ignore
        .map((nav) => nav.type)
        .includes("reload"),
    []
  );

  // Redirect the user to the loading screen if they reload the page.
  useEffect(() => {
    if (isReload) {
      // console.log("detected reload");
      window.location.href = "/loading/title";
    }
  }, [isReload]);

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
    if (route.name === "about") {
      return <About />;
    }
    if (route.name === "end") {
      return <End />;
    }
    throw new Error(`Unknown route: ${route.name}`);
  }, [route.name, route.params.destination]);

  const shouldShowNavbar = useMemo(
    () =>
      ["hub", "level", "dialog", "journal_section", "end"].includes(route.name),
    [route.name]
  );

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {currPage()}
    </>
  );
}
