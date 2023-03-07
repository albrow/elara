import { Container } from "@chakra-ui/react";
import { useEffect } from "react";
import { useRouteNode } from "react-router5";

import HomeContent from "../components/home.mdx";
import "../styles/md_content.css";

export default function Home() {
  const { route } = useRouteNode("");

  useEffect(() => {
    document.title = "Elara | Home";
  }, [route.name]);

  return (
    <Container maxW="container.xl" p={8}>
      <div className="md-content">
        <HomeContent />
      </div>
    </Container>
  );
}
