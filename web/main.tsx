import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { createHashRouter, RouterProvider } from "react-router-dom";

import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/900.css";

import init from "../elara-lib/pkg";
import Home from "./routes/home";
import Journal from "./routes/journal";

const elaraTheme = extendTheme({
  fonts: {
    heading: "Nunito, sans-serif",
    body: "Nunito, sans-serif",
  },
});

(async function () {
  await init();

  // Workaround for hosting on GitHub Pages.
  // See: https://itnext.io/so-you-want-to-host-your-single-age-react-app-on-github-pages-a826ab01e48
  let routerBaseName = "/";
  try {
    // @ts-ignore
    routerBaseName = process.env.PUBLIC_URL;
  } catch {}

  // Importing other components *after* init() means the Components themselves
  // can be synchrounous and not worry about waiting for Wasm to load.
  const Root = (await import("./routes/root")).default;
  const Level = (await import("./routes/level")).default;

  const router = createHashRouter(
    [
      {
        path: "/",
        element: <Root />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
          {
            path: "/level/:levelNumber",
            element: <Level />,
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
    ],
    {
      basename: routerBaseName,
    }
  );

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ChakraProvider theme={elaraTheme} resetCSS={true}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </React.StrictMode>
  );
})();
