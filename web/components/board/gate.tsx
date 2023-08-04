import { Image } from "@chakra-ui/react";
import { useMemo } from "react";

import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import { GATE_Z_INDEX } from "../../lib/constants";
import lockedImgUrl from "../../images/board/gate_locked.png";
import unlockedImgUrl from "../../images/board/gate_unlocked.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import BoardHoverInfo from "./board_hover_info";
import GatePage from "./hover_info_pages/gate.mdx";

export interface GateProps {
  pos: Pos;
  open: boolean;
  additionalInfo: string;
  enableHoverInfo: boolean;
}

export default function Gate(props: GateProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, GATE_Z_INDEX),
    [props.pos.y]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={GatePage}
          offset={offset}
          additionalInfo={props.additionalInfo}
        />
      )}
      <Image
        alt={props.open ? "locked gate" : "unlocked gate"}
        src={props.open ? unlockedImgUrl : lockedImgUrl}
        position="absolute"
        w="48px"
        h="72px"
        zIndex={zIndex}
        left={offset.left}
        top={offset.topNum - 24}
        // TODO(albrow): Standardize drop shadows for sprites.
        filter="drop-shadow(0px 3px 1px rgba(0, 0, 0, 0.3))"
      />
    </>
  );
}
