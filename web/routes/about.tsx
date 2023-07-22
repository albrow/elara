import { Box, Button, Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouteNode } from "react-router5";

import { MdArrowBack } from "react-icons/md";

import AboutContent from "../components/about.mdx";
import "../styles/md_content.css";
import { useSceneNavigator } from "../hooks/scenes_hooks";

export default function About() {
  const { route } = useRouteNode("");
  const { navigateToTitle } = useSceneNavigator();

  useEffect(() => {
    document.title = "Elara | About";
  }, [route.name]);

  return (
    <Box w="100%" h="100%" position="fixed" bgColor="white">
      <Box p="10px">
        <Button colorScheme="blue" variant="ghost" onClick={navigateToTitle}>
          <MdArrowBack size="1.3em" style={{ marginRight: "0.2rem" }} />
          <span>Back to Title Screen</span>
        </Button>
      </Box>
      <Container maxW="container.xl" px="30px" pb="30px">
        <div className="md-content">
          <AboutContent />
        </div>
      </Container>
    </Box>
  );
}
