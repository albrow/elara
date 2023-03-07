import { Link, useRouter } from "react-router5";
import { Box } from "@chakra-ui/react";

interface NavbarLinkProps {
  routeName: string;
  routeParams?: Record<string, any>;
  text: string;
}

export default function NavbarLink(props: NavbarLinkProps) {
  const router = useRouter();
  const isActive = router.isActive(props.routeName, props.routeParams);

  return (
    <Link routeName={props.routeName} routeParams={props.routeParams}>
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
        {props.text}
      </Box>
    </Link>
  );
}

NavbarLink.defaultProps = {
  routeParams: {},
};
