import { PropsWithChildren } from "react";
import { Link } from "react-router5";

export interface DisablableLinkProps {
  routeName: string;
  routeParams?: Record<string, any>;
  disabled?: boolean;
}

export default function DisablableLink(
  props: PropsWithChildren<DisablableLinkProps>
) {
  if (props.disabled) {
    return <span>{props.children}</span>;
  }

  return (
    <Link routeName={props.routeName} routeParams={props.routeParams}>
      {props.children}
    </Link>
  );
}

DisablableLink.defaultProps = {
  routeParams: {},
};
