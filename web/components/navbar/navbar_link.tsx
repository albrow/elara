import { Link, useLocation } from "react-router-dom";
import { Box } from "@chakra-ui/react";

interface NavbarLinkProps {
  to: string;
  name: string;
}

export default function NavbarLink(props: NavbarLinkProps) {
  const location = useLocation();
  let isActive = location.pathname === props.to;

  // Special case for journal links. We consider the link active if
  // we are currently viewing at a section, which is a subroute of
  // /journal/
  if (location.pathname.startsWith("/journal/")) {
    isActive = props.to.startsWith("/journal");
  }

  return (
    <Link to={props.to}>
      <Box
        fontWeight="bold"
        minW="max"
        mr={4}
        p={1}
        px={4}
        rounded="lg"
        color={isActive ? "white" : "gray.300"}
        background={isActive ? "gray.700" : "gray.800"}
        _hover={
          !isActive ? { background: "var(--chakra-colors-gray-700)" } : {}
        }
      >
        {props.name}
      </Box>
    </Link>
  );
}
