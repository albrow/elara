import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export interface DisablableLinkProps {
  to: string;
  disabled?: boolean;
}

export default function DisablableLink(
  props: PropsWithChildren<DisablableLinkProps>
) {
  if (props.disabled) {
    return <span>{props.children}</span>;
  }
  return <Link to={props.to}>{props.children}</Link>;
}
