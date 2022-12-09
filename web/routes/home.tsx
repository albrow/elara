import { Container } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import HomeContent from "../components/home.mdx";
import "../styles/md_content.css";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    document.title = "Elara | Home";
  }, [location]);

  return (
    <Container maxW="container.xl" p={8}>
      <div className="md-content">
        <HomeContent />
      </div>
    </Container>
  );
}
