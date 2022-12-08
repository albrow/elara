import { Container } from "@chakra-ui/react";
import { useEffect } from "react";

import HomeContent from "../components/home.mdx";
import "../styles/md_content.css";

export default function Home() {
  useEffect(() => {
    document.title = "Elara | Home";
  });

  return (
    <Container maxW="container.xl" p={8}>
      <div className="md-content">
        <HomeContent />
      </div>
    </Container>
  );
}
