import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import createRouter from "router5";
import { RouterProvider } from "react-router5";
import type { Route } from "router5";
import loggerPlugin from "router5-plugin-logger";
import browserPlugin from "router5-plugin-browser";

import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/900.css";

import init from "../elara-lib/pkg";
import { SaveDataProvider } from "./contexts/save_data";
import { ShortsModalProvider } from "./contexts/shorts_modal";
import { TOOL_TIP_Z_INDEX, TUTORIAL_MODAL_Z_INDEX } from "./lib/constants";

const elaraTheme = extendTheme({
  fonts: {
    heading: "Nunito, sans-serif",
    body: "Nunito, sans-serif",
  },
  zIndices: {
    tooltip: TOOL_TIP_Z_INDEX,
    modal: TUTORIAL_MODAL_Z_INDEX,
    modalOverlay: TUTORIAL_MODAL_Z_INDEX - 2,
  },
});

// eslint-disable-next-line func-names
(async function () {
  await init();

  // Importing other components *after* init() means the Components themselves
  // can be synchrounous and not worry about waiting for Wasm to load.
  const Root = (await import("./routes/root")).default;
  const { ScenesProvider } = await import("./contexts/scenes");

  const routes: Route[] = [
    {
      name: "home",
      path: "/",
    },
    {
      name: "level",
      path: "/level/:levelId",
    },
    {
      name: "dialog",
      path: "/dialog/:treeName",
    },
    {
      name: "journal",
      path: "/journal",
    },
    {
      name: "journal_section",
      path: "/journal/:sectionName",
    },
    {
      name: "demo_level",
      path: "/demo_level/:levelId",
    },
  ];

  const router = createRouter(routes, {
    defaultRoute: "home",
  });
  router.usePlugin(browserPlugin());
  router.usePlugin(loggerPlugin);
  router.start();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router}>
        <ChakraProvider theme={elaraTheme} resetCSS>
          <SaveDataProvider>
            <ScenesProvider>
              <ShortsModalProvider>
                <Root />
              </ShortsModalProvider>
            </ScenesProvider>
          </SaveDataProvider>
        </ChakraProvider>
      </RouterProvider>
    </React.StrictMode>
  );
})();
