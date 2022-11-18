import { Outlet, useLocation, Navigate } from "react-router-dom";
import NavbarLink from "../components/navbar_link";

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
    <div className="h-screen">
      <div className="w-full h-1 bg-gray-900"></div>
      <div id="nav" className="bg-gray-800 pb-2 px-2 mb-0 flex flex-row">
        <NavbarLink to="/home" name="Home" />
        <NavbarLink to="/journal" name="Journal" />
        <NavbarLink to="/level/1" name="Level 1" />
        <NavbarLink to="/level/2" name="Level 2" />
        <NavbarLink to="/level/3" name="Level 3" />
        <NavbarLink to="/level/4" name="Level 4" />
        <NavbarLink to="/level/5" name="Level 5" />
        <NavbarLink to="/level/6" name="Level 6" />
      </div>
      <Outlet />
    </div>
  );
}
