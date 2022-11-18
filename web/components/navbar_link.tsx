import { Link, useLocation } from "react-router-dom";

interface NavbarLinkProps {
  to: string;
  name: string;
}

export default function NavbarLink(props: NavbarLinkProps) {
  const location = useLocation();
  const isActive = location.pathname == props.to;
  console.log(location.pathname);
  console.log(props.to);
  console.log(isActive);
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
