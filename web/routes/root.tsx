import { useRouteNode } from "react-router5";
import { useCallback, useEffect, useMemo } from "react";

import { Box } from "@chakra-ui/react";
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

  // Detect if the user reloaded the page or directly visited a URL other than
  // the root.
  const isDirectVisitOrReload = useMemo(() => {
    const { referrer } = document;
    return (
      referrer === "" ||
      !referrer.startsWith(
        `${window.location.protocol}//${window.location.host}`
      )
    );
  }, []);

  const shouldRedirect = useMemo(
    () =>
      isDirectVisitOrReload && route.name !== "loading" && route.name !== "",
    [isDirectVisitOrReload, route.name]
  );

  // Redirect the user to the loading screen if they reload the page or directly
  // visit a URL other than the root.
  useEffect(() => {
    if (shouldRedirect) {
      window.location.href = "/loading/title";
    }
  }, [isDirectVisitOrReload, route.name, shouldRedirect]);

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
      {shouldRedirect && <Box w="100%" h="100%" bg="black" position="fixed" />}
      {!shouldRedirect && (
        <>
          {shouldShowNavbar && <Navbar />}
          {currPage()}
        </>
      )}
    </>
  );
}
