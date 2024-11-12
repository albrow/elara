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
import { FunctionUnlockedModalProvider } from "./contexts/function_unlocked_modal";
import { DialogModalProvider } from "./contexts/dialog_modal";
import {
  CHAKRA_TOOL_TIP_Z_INDEX,
  ROVER_MESSAGE_Z_INDEX,
  CHAKRA_MODAL_Z_INDEX,
  CHALLENGE_TOOL_TIP_Z_INDEX,
} from "./lib/constants";
import {
  BP_SM,
  BP_MD,
  BP_LG,
  BP_XL,
  BP_2XL,
  BP_3XL,
} from "./lib/responsive_design";

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
    sm: `${BP_SM}px`,
    md: `${BP_MD}px`,
    lg: `${BP_LG}px`,
    xl: `${BP_XL}px`,
    "2xl": `${BP_2XL}px`,
    "3xl": `${BP_3XL}px`,
  },
  sizes: {
    "container.xl": `${BP_XL}px`,
    // Not sure if sizes should equal breakpoints here.
    // "container.2xl": `${BP_2XL}px`,
    // "container.3xl": `${BP_3XL}px`,
  },
  components: {
    Tooltip: {
      variants: {
        "rover-message": {
          zIndex: ROVER_MESSAGE_Z_INDEX,
        },
        challenge: {
          // backgroundColor: "gray.600",
          zIndex: CHALLENGE_TOOL_TIP_Z_INDEX,
          border: "1px solid black",
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
  // Hard-code the color mode so that chakra doesn't try to set the cookie:
  initialColorMode: "light",
});

function getDefaultRouteOptions() {
  if (ELARA_BUILD_TARGET === "electron") {
    // Skip the loading screen for Electron apps and go straight to the
    // title screen.
    return {
      defaultRoute: "title",
    };
  }
  // Otherwise show the loading screen. We do this for two reasons actually:
  //
  //   1. It gives time for sounds and other resources to load.
  //   2. It forces the player to click the screen which enables autoplay for sound and videos.
  //
  return {
    defaultRoute: "loading",
    defaultParams: { destination: "title" },
  };
}

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
  const { LevelSelectModalProvider } = await import(
    "./contexts/level_select_modal"
  );

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
      name: "cutscene",
      path: "/cutscene/:cutsceneId",
    },
    {
      name: "end",
      path: "/end",
    },
  ];

  const router = createRouter(routes, getDefaultRouteOptions());

  // For local development, enable browser plugin. This means if we
  // refresh the page, we'll stay on the same route instead of being
  // kicked back to the loading screen.
  if (import.meta.env.DEV) {
    router.usePlugin(browserPlugin());
  } else if (
    window.location.hostname === "play.elaragame.com" &&
    window.location.pathname !== "/"
  ) {
    // If we are on play.elaragame.com and not in DEV mode, always kick the
    // player back to the canonical URL. We don't want players to be able to
    // cheat or break the game by manually changing the URL, so we effectively
    // disable URL-based routing. That means the route doesn't actually do anything,
    // so removing it from the URL can make things less confusing and help with SEO.
    //
    // Note however, that if the game is hosted on a different location (e.g. on Itch.io),
    // we don't want to do this, since it will break the game. That's why we check
    // window.location.hostname first.
    window.location.pathname = "/";
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
                        <FunctionUnlockedModalProvider>
                          <LevelSelectModalProvider>
                            <DialogModalProvider>
                              <Root />
                            </DialogModalProvider>
                          </LevelSelectModalProvider>
                        </FunctionUnlockedModalProvider>
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
