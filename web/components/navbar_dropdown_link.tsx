import { Link, useLocation } from "react-router-dom";
import { Box, MenuItem } from "@chakra-ui/react";

interface NavbarDropdownLinkProps {
  to: string;
  name: string;
}

export default function NavbarDropdownLink(props: NavbarDropdownLinkProps) {
  const location = useLocation();
  let isActive = location.pathname == props.to;

  return (
    <MenuItem background="gray.700" width="100%">
      <Link to={props.to} style={{ width: "100%" }}>
        <Box
          fontWeight="bold"
          width="100%"
          p={1}
          px={4}
          rounded="lg"
          color={isActive ? "white" : "gray.300"}
          background={isActive ? "gray.600" : "gray.700"}
          _hover={
            !isActive ? { background: "var(--chakra-colors-gray-600)" } : {}
          }
        >
          {props.name}
        </Box>
      </Link>
    </MenuItem>
  );
}
