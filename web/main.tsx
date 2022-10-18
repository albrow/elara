import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Route } from "react-router-dom";

import init from "../battle-game-lib/pkg/battle_game_lib";
import Root from "./routes/root";
import Level from "./routes/level";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/level/:levelNumber",
        element: <Level />,
      },
    ],
  },
]);

(async function () {
  await init();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
})();
