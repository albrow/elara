import { Box } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { Link } from "react-router5";

export interface DisablableLinkProps {
  routeName: string;
  routeParams?: Record<string, any>;
  disabled?: boolean;
  onClick?: () => void;
}

export default function DisablableLink(
  props: PropsWithChildren<DisablableLinkProps>
) {
  if (props.disabled) {
    return <span>{props.children}</span>;
  }

  return (
    <Box
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      <Link routeName={props.routeName} routeParams={props.routeParams}>
        {props.children}
      </Link>
    </Box>
  );
}

DisablableLink.defaultProps = {
  routeParams: {},
};
