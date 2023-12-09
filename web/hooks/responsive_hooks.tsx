import { useEffect, useState } from "react";

export const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    function onWindowResize() {
      setWindowWidth(window.innerWidth);
    }
    // Trigger this function on resize
    window.addEventListener("resize", onWindowResize);
    //  Cleanup for componentWillUnmount
    return () => window.removeEventListener("resize", onWindowResize);
  }, []);
  return windowWidth;
};