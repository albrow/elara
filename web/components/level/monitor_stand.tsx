import { Box, Image } from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";

import { MONITOR_STAND_Z_INDEX } from "../../lib/constants";
import monitorStandBaseImg from "../../images/monitor_stand_base.png";

const MONITOR_STAND_BASE_WIDTH = 40.5;
const MONITOR_STAND_BASE_HEIGHT = 32;

interface MonitorStandProps {
  monitorFrameRef: React.RefObject<HTMLDivElement>;
}

function findParentScrollableElement(
  el: HTMLElement | null
): HTMLElement | null {
  if (!el) return null;
  const { overflow } = window.getComputedStyle(el);
  if (overflow === "scroll" || overflow === "auto") {
    return el;
  }
  return findParentScrollableElement(el.parentElement);
}

export default function MonitorStand(props: MonitorStandProps) {
  const [fillColor, setFillColor] = React.useState("transparent");

  const [monitorPosition, setMonitorPosition] = React.useState(() => {
    const monitorFrame = props.monitorFrameRef.current;
    if (monitorFrame) {
      const monitorFrameRect = monitorFrame.getBoundingClientRect();
      return monitorFrameRect;
    }
    return null;
  });

  // Whenever the window resizes, set the window width/height and monitor frame positions.
  // These are used to calculate where the monitor stand should be drawn.
  useEffect(() => {
    if (props.monitorFrameRef.current) {
      const monitorFrameRect =
        props.monitorFrameRef.current.getBoundingClientRect();
      setMonitorPosition(monitorFrameRect);
    }

    function onWindowResizeOrScroll() {
      if (props.monitorFrameRef.current) {
        const monitorFrameRect =
          props.monitorFrameRef.current.getBoundingClientRect();
        setMonitorPosition(monitorFrameRect);
      }
    }
    // Trigger this function on resize/scroll
    window.addEventListener("resize", onWindowResizeOrScroll);
    window.addEventListener("scroll", onWindowResizeOrScroll);
    const parentEl = findParentScrollableElement(props.monitorFrameRef.current);
    if (parentEl) {
      parentEl.addEventListener("scroll", onWindowResizeOrScroll);
    }

    //  Cleanup for componentWillUnmount
    return () => {
      window.removeEventListener("resize", onWindowResizeOrScroll);
      window.removeEventListener("scroll", onWindowResizeOrScroll);
      const parent = findParentScrollableElement(props.monitorFrameRef.current);
      if (parent) {
        parent.removeEventListener("scroll", onWindowResizeOrScroll);
      }
    };
  }, [props.monitorFrameRef]);

  // Grab the border color from the monitor frame element and use that as
  // the fill color for the monitor stand.
  useEffect(() => {
    const monitorFrame = props.monitorFrameRef.current;
    if (monitorFrame) {
      const { borderColor } = window.getComputedStyle(monitorFrame);
      setFillColor(borderColor);
    }
  }, [props.monitorFrameRef]);

  const standpointLeft = useMemo(() => {
    if (monitorPosition) {
      return {
        x: monitorPosition.left + 2,
        y: monitorPosition.bottom,
      };
    }
    return { x: -100, y: -100 };
  }, [monitorPosition]);

  const standpointRight = useMemo(() => {
    if (monitorPosition) {
      return {
        x: monitorPosition.right - 2,
        y: monitorPosition.bottom,
      };
    }
    return { x: -100, y: -100 };
  }, [monitorPosition]);

  const standpointBottom = useMemo(() => {
    if (monitorPosition) {
      return {
        x:
          monitorPosition.left +
          (monitorPosition.right - monitorPosition.left) / 2,
        y: monitorPosition.bottom + 100,
      };
    }
    return { x: -100, y: -100 };
  }, [monitorPosition]);

  return (
    <>
      {/* SVG lines representing the monitor stand */}
      <Box
        position="fixed"
        w="100%"
        h="100%"
        zIndex={MONITOR_STAND_Z_INDEX}
        style={{
          filter: "drop-shadow(1px 3px 2px rgb(0 0 0 / 0.3)) brightness(1.1)",
        }}
      >
        <svg
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
        >
          <line
            x1={standpointLeft.x}
            x2={standpointBottom.x}
            y1={standpointLeft.y}
            y2={standpointBottom.y}
            stroke={fillColor}
            strokeWidth="1"
            strokeLinecap="butt"
          />
          <line
            x1={standpointRight.x}
            x2={standpointBottom.x}
            y1={standpointRight.y}
            y2={standpointBottom.y}
            stroke={fillColor}
            strokeWidth="1"
            strokeLinecap="butt"
          />
        </svg>
      </Box>
      {/* Image for the monitor stand base */}
      <Box
        position="fixed"
        zIndex={MONITOR_STAND_Z_INDEX + 1}
        style={{
          filter: "drop-shadow(1px 1px 3px rgb(0 0 0 / 0.3)) brightness(0.8)",
        }}
        left={`${standpointBottom.x - MONITOR_STAND_BASE_WIDTH / 2 - 2}px`}
        top={`${standpointBottom.y - 10}px`}
      >
        <Image
          src={monitorStandBaseImg}
          alt=""
          w={`${MONITOR_STAND_BASE_WIDTH}px`}
          h={`${MONITOR_STAND_BASE_HEIGHT}px`}
        />
      </Box>
    </>
  );
}
