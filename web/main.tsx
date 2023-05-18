import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import createRouter from "router5";
import { RouterProvider } from "react-router5";
import type { Route } from "router5";
import browserPlugin from "router5-plugin-browser";

import "@fontsource/nunito/600.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";

import init from "../elara-lib/pkg";
import { SaveDataProvider } from "./contexts/save_data";
import { ShortsModalProvider } from "./contexts/shorts_modal";

import { ErrorModalProvider } from "./contexts/error_modal";

const elaraTheme = extendTheme({
  fonts: {
    heading: "Nunito, sans-serif",
    body: "Nunito, sans-serif",
  },
  zIndices: {
    // NOTE(albrow): Below code breaks tooltips inside of modals, so I commented
    // it out. Maybe it's not necessary?
    //
    // tooltip: CHAKRA_TOOL_TIP_Z_INDEX,
    // modal: TUTORIAL_MODAL_Z_INDEX,
    // modalOverlay: TUTORIAL_MODAL_Z_INDEX - 2,
  },
});

// eslint-disable-next-line func-names
(async function () {
  await init();

  // Importing other components *after* init() means the Components themselves
  // can be synchrounous and not worry about waiting for Wasm to load.
  const Root = (await import("./routes/root")).default;
  const { ScenesProvider } = await import("./contexts/scenes");
  const { HintsModalProvider } = await import("./contexts/hints_modal");
  const { SoundProvider } = await import("./contexts/sound_manager");

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
      name: "end",
      path: "/end",
    },
  ];

  const router = createRouter(routes, {
    defaultRoute: "home",
  });
  router.usePlugin(browserPlugin());
  router.start();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router}>
        <SoundProvider>
          <ChakraProvider theme={elaraTheme} resetCSS>
            <SaveDataProvider>
              <ScenesProvider>
                <ShortsModalProvider>
                  <ErrorModalProvider>
                    <HintsModalProvider>
                      <Root />
                    </HintsModalProvider>
                  </ErrorModalProvider>
                </ShortsModalProvider>
              </ScenesProvider>
            </SaveDataProvider>
          </ChakraProvider>
        </SoundProvider>
      </RouterProvider>
    </React.StrictMode>
  );
})();
