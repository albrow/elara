import { Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouteNode } from "react-router5";

import AboutContent from "../components/about.mdx";
import "../styles/md_content.css";

export default function About() {
  const { route } = useRouteNode("");

  useEffect(() => {
    document.title = "Elara | About";
  }, [route.name]);

  return (
    <Container maxW="container.xl" p={8}>
      <div className="md-content">
        <AboutContent />
      </div>
    </Container>
  );
}
