import { Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouteNode } from "react-router5";

import AboutContent from "../components/about.mdx";
import "../styles/md_content.css";
import { NAVBAR_HEIGHT } from "../lib/constants";

export default function About() {
  const { route } = useRouteNode("");

  useEffect(() => {
    document.title = "Elara | About";
  }, [route.name]);

  return (
    <Container maxW="container.xl" p={8} mt={`${NAVBAR_HEIGHT}px`}>
      <div className="md-content">
        <AboutContent />
      </div>
    </Container>
  );
}
