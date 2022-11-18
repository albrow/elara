import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";

import init from "../elara-lib/pkg";
import Home from "./routes/home";
import Journal from "./routes/journal";

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
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();
