import { Container } from "@chakra-ui/react";

import HomeContent from "../components/home.mdx";
import "../styles/md_content.css";

export default function Home() {
  return (
    <Container maxW="container.xl" p={8}>
      <div className="md-content">
        <HomeContent />
      </div>
    </Container>
  );
}
