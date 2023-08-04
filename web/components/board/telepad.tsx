import { Box, Image } from "@chakra-ui/react";
import { useMemo } from "react";

import { TELEPAD_Z_INDEX } from "../../lib/constants";
import telepadBlueEntranceUrl from "../../images/board/telepad_blue_entrance.png";
import telepadBlueExitUrl from "../../images/board/telepad_blue_exit.png";
import telepadGreenEntranceUrl from "../../images/board/telepad_green_entrance.png";
import telepadGreenExitUrl from "../../images/board/telepad_green_exit.png";
import telepadPurpleEntranceUrl from "../../images/board/telepad_purple_entrance.png";
import telepadPurpleExitUrl from "../../images/board/telepad_purple_exit.png";
import { Pos } from "../../../elara-lib/pkg/elara_lib";
import { posToOffset, rowBasedZIndex } from "../../lib/utils";
import TelepadExitPage from "./hover_info_pages/telepad_exit.mdx";
import TelepadEntrancePage from "./hover_info_pages/telepad_entrance.mdx";
import BoardHoverInfo from "./board_hover_info";

export type TelepadKind = "entrance" | "exit";

interface TelepadProps {
  pos: Pos;
  kind: TelepadKind;
  telepadIndex: number;
  enableHoverInfo: boolean;
}

const SPRITE_URLS = [
  {
    entrance: telepadGreenEntranceUrl,
    exit: telepadGreenExitUrl,
  },
  {
    entrance: telepadPurpleEntranceUrl,
    exit: telepadPurpleExitUrl,
  },
  {
    entrance: telepadBlueEntranceUrl,
    exit: telepadBlueExitUrl,
  },
];

export default function Telepad(props: TelepadProps) {
  const offset = useMemo(() => posToOffset(props.pos), [props.pos]);
  const zIndex = useMemo(
    () => rowBasedZIndex(props.pos.y, TELEPAD_Z_INDEX),
    [props.pos.y]
  );
  const imgUrl = useMemo(
    () =>
      props.kind === "entrance"
        ? SPRITE_URLS[props.telepadIndex].entrance
        : SPRITE_URLS[props.telepadIndex].exit,
    [props.kind, props.telepadIndex]
  );

  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={
            props.kind === "entrance" ? TelepadEntrancePage : TelepadExitPage
          }
          offset={offset}
        />
      )}
      <Box>
        <Image
          alt="telepad_entrance"
          src={imgUrl}
          position="absolute"
          left={offset.left}
          top={offset.top}
          w="48px"
          h="48px"
          mt="1px"
          ml="1px"
          zIndex={zIndex}
        />
      </Box>
    </>
  );
}
