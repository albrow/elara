import { Link, useLocation } from "react-router-dom";
import { Box, MenuItem } from "@chakra-ui/react";

interface NavbarDropdownLinkProps {
  to: string;
}

export default function NavbarDropdownLink(
  props: React.PropsWithChildren<NavbarDropdownLinkProps>
) {
  const location = useLocation();
  let isActive = location.pathname == props.to;

  return (
    <Link to={props.to}>
      <MenuItem
        background={isActive ? "gray.600" : "gray.700"}
        _hover={
          !isActive ? { background: "var(--chakra-colors-gray-600)" } : {}
        }
      >
        <Box fontWeight="bold" color={isActive ? "white" : "gray.300"}>
          {props.children}
        </Box>
      </MenuItem>
    </Link>
  );
}
