import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <>
      <div id="nav">
        <Link to="/">
          <span className="text-lg font-bold text-blue-500 mx-4">Home</span>
        </Link>
        <Link to="/level/1">
          <span className="text-lg font-bold text-blue-500 mx-4">Level 1</span>
        </Link>
        <Link to="/level/2">
          <span className="text-lg font-bold text-blue-500 mx-4">Level 2</span>
        </Link>
      </div>
      <Outlet />
    </>
  );
}