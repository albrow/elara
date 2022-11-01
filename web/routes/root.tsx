import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div id="nav" className="bg-gray-800 p-2">
        <Link to="/">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Home
          </span>
        </Link>
        <Link to="/level/1">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 1
          </span>
        </Link>
        <Link to="/level/2">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 2
          </span>
        </Link>
        <Link to="/level/3">
          <span className="text-lg text-white hover:text-blue-400 active:text-blue-500 mx-4">
            Level 3
          </span>
        </Link>
      </div>
      <Outlet />
    </>
  );
}
