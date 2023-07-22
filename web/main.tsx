// @refresh reset

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
import "@fontsource/caveat/400.css";

import init from "../elara-lib/pkg";
import { SaveDataProvider } from "./contexts/save_data";
import { ShortsModalProvider } from "./contexts/shorts_modal";
import { ErrorModalProvider } from "./contexts/error_modal";
import {
  CHAKRA_TOOL_TIP_Z_INDEX,
  ROVER_SPEECH_Z_INDEX,
  TUTORIAL_MODAL_Z_INDEX,
} from "./lib/constants";

// This file doesn't play nicely with HMR/Fast refresh, so we just reload the page
// if any changes are detected.
// @refresh reset
// @vite-ignore
// @ts-ignore
if (import.meta.hot) {
  import.meta.hot.accept((_: any) => {
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  });
}

const elaraTheme = extendTheme({
  fonts: {
    heading: "Nunito, sans-serif",
    body: "Nunito, sans-serif",
  },
  breakpoints: {
    sm: "30em", // 480px (default)
    md: "48em", // 768px (default)
    lg: "62em", // 992px (default)
    xl: "1268px", // (customized)
    "2xl": "1500px", // (customized)
  },
  sizes: {
    "container.xl": "1268px",
  },
  components: {
    Tooltip: {
      variants: {
        "speech-bubble": {
          zIndex: ROVER_SPEECH_Z_INDEX,
        },
      },
    },
  },
  zIndices: {
    // Fixes z-index
    tooltip: CHAKRA_TOOL_TIP_Z_INDEX,
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
  const { HintsModalProvider } = await import("./contexts/hints_modal");
  const { SoundProvider } = await import("./contexts/sound_manager");

  const routes: Route[] = [
    {
      name: "title",
      path: "/title",
    },
    {
      name: "loading",
      path: "/loading/*destination",
    },
    {
      name: "about",
      path: "/about",
    },
    {
      name: "hub",
      path: "/hub",
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
    defaultRoute: "loading",
    defaultParams: { destination: "title" },
  });
  router.usePlugin(browserPlugin());
  router.start();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router}>
        <ChakraProvider theme={elaraTheme} resetCSS>
          <SaveDataProvider>
            <SoundProvider>
              <ScenesProvider>
                <ShortsModalProvider>
                  <ErrorModalProvider>
                    <HintsModalProvider>
                      <Root />
                    </HintsModalProvider>
                  </ErrorModalProvider>
                </ShortsModalProvider>
              </ScenesProvider>
            </SoundProvider>
          </SaveDataProvider>
        </ChakraProvider>
      </RouterProvider>
    </React.StrictMode>
  );
})();
