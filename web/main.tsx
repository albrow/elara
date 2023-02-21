import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
    // TODO(albrow): Combine modal z index constants into one.
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
  const Home = (await import("./routes/home")).default;
  const Level = (await import("./routes/level")).default;
  const Journal = (await import("./routes/journal")).default;
  const DialogOverBg = (await import("./routes/dialog_over_bg")).default;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      children: [
        {
          path: "/home",
          element: <Home />,
        },
        {
          path: "/level/:levelId",
          element: <Level />,
        },
        {
          path: "/dialog/:treeName",
          element: <DialogOverBg />,
        },
        {
          path: "/journal",
          element: <Journal />,
        },
        {
          path: "/journal/concepts/:sectionName",
          element: <Journal />,
        },
      ],
    },
  ]);

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ChakraProvider theme={elaraTheme} resetCSS>
        <SaveDataProvider>
          <ShortsModalProvider>
            <RouterProvider router={router} />
          </ShortsModalProvider>
        </SaveDataProvider>
      </ChakraProvider>
    </React.StrictMode>
  );
})();
