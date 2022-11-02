import { Outlet, Link, useLocation, Navigate } from "react-router-dom";

export default function Root() {
  let location = useLocation();

  if (location.pathname == "/") {
    // This seems to be necessary because of how child routes
    // work in React Router v6. We can't simply display the content
    // of Home.tsx inside of Root.tsx, because that would result in the
    // content being displayed on *every* child route, which is not what
    // we want.
    //
    // So instead, we make it so Root.tsx contains *just* the nav bar
    // then we automatically redirect to /home if you try to visit /
    // directly.
    return <Navigate to="/home" />;
  }

  return (
    <>
      <div id="nav" className="bg-gray-800 p-2 mb-0 2xl:mb-10">
        <Link to="/home">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Home
          </span>
        </Link>
        <Link to="/level/1">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 1
          </span>
        </Link>
        <Link to="/level/2">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 2
          </span>
        </Link>
        <Link to="/level/3">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 3
          </span>
        </Link>
        <Link to="/level/4">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 4
          </span>
        </Link>
      </div>
      <Outlet />
    </>
  );
}
