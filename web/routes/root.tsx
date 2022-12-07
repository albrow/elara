import { Outlet, useLocation, Navigate, Link } from "react-router-dom";
import { Container } from "@chakra-ui/react";

import Navbar from "../components/navbar/navbar";

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
    <Container minW="container.md" maxW="none" p={0}>
      <Navbar />
      <Outlet />
    </Container>
  );
}
