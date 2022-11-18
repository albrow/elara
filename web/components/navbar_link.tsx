import { Link, useLocation } from "react-router-dom";

interface NavbarLinkProps {
  to: string;
  name: string;
}

export default function NavbarLink(props: NavbarLinkProps) {
  const location = useLocation();
  let isActive = location.pathname == props.to;

  // Special case for journal links. We consider the link active if
  // we are currently viewing at a section, which is a subroute of
  // /journal/
  if (location.pathname.startsWith("/journal/")) {
    isActive = props.to.startsWith("/journal");
  }

  return (
    <Link to={props.to}>
      <div
        className={
          (isActive ? "bg-blue-400 " : "") +
          "h-1 mb-1 z-10 mx-2 relative -top-1"
        }
      ></div>
      <div className="text-lg text-white hover:text-gray-300 active:text-gray-400 mx-4">
        {props.name}
      </div>
    </Link>
  );
}
