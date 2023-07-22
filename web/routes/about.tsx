import { Box, Container } from "@chakra-ui/react";
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
    <Box w="100%" h="100%" position="fixed" bgColor="white">
      <Container maxW="container.xl" p={8}>
        <div className="md-content">
          <AboutContent />
        </div>
      </Container>
    </Box>
  );
}
