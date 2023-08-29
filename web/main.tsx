// @refresh reset

import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import createRouter from "router5";
import { RouterProvider } from "react-router5";
import browserPlugin from "router5-plugin-browser";
import type { Route } from "router5";

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
  ROVER_MESSAGE_Z_INDEX,
  CHAKRA_MODAL_Z_INDEX,
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
        "rover-message": {
          zIndex: ROVER_MESSAGE_Z_INDEX,
        },
      },
    },
  },
  zIndices: {
    // Fixes z-indexes so they always sit in the correct order relative
    // to our other UI elements.
    tooltip: CHAKRA_TOOL_TIP_Z_INDEX,
    modal: CHAKRA_MODAL_Z_INDEX,
    modalOverlay: CHAKRA_MODAL_Z_INDEX - 2,
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
  const { JukeboxProvider } = await import("./contexts/jukebox");

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

  // For local development, enable browser plugin. This means if we
  // refresh the page, we'll stay on the same route instead of being
  // kicked back to the loading screen.
  if (import.meta.env.DEV) {
    router.usePlugin(browserPlugin());
  }

  router.start();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router}>
        <ChakraProvider theme={elaraTheme} resetCSS>
          <SaveDataProvider>
            <SoundProvider>
              <JukeboxProvider>
                <ScenesProvider>
                  <ShortsModalProvider>
                    <ErrorModalProvider>
                      <HintsModalProvider>
                        <Root />
                      </HintsModalProvider>
                    </ErrorModalProvider>
                  </ShortsModalProvider>
                </ScenesProvider>
              </JukeboxProvider>
            </SoundProvider>
          </SaveDataProvider>
        </ChakraProvider>
      </RouterProvider>
    </React.StrictMode>
  );
})();
