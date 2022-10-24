import { useState } from "react";

import { TILE_SIZE } from "../../lib/constants";

export interface SquareProps {
  x: number;
  y: number;
}

export default function Square(props: SquareProps) {
  let [isHovered, setIsHovered] = useState(false);

  return (
    <td
      className="square"
      style={{ width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="coords text-xs w-full h-full cursor-crosshair font-mono">
        <div>{isHovered ? `x=${props.x}` : ""}</div>
        <div>{isHovered ? `y=${props.y}` : ""}</div>
      </div>
    </td>
  );
}
