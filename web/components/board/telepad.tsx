import { Box } from "@chakra-ui/react";
import { Offset } from "../../lib/utils";
import { TELEPAD_Z_INDEX, TILE_SIZE } from "../../lib/constants";

import telepadBlueEntranceUrl from "../../images/board/telepad_blue_entrance.png";
import telepadBlueExitUrl from "../../images/board/telepad_blue_exit.png";
import telepadGreenEntranceUrl from "../../images/board/telepad_green_entrance.png";
import telepadGreenExitUrl from "../../images/board/telepad_green_exit.png";
import telepadPurpleEntranceUrl from "../../images/board/telepad_purple_entrance.png";
import telepadPurpleExitUrl from "../../images/board/telepad_purple_exit.png";
import TelepadExitPage from "./hover_info_pages/telepad_exit.mdx";
import TelepadEntrancePage from "./hover_info_pages/telepad_entrance.mdx";
import BoardHoverInfo from "./board_hover_info";

export type TelepadKind = "entrance" | "exit";

interface TelepadProps {
  offset: Offset;
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
  return (
    <>
      {props.enableHoverInfo && (
        <BoardHoverInfo
          page={
            props.kind === "entrance" ? TelepadEntrancePage : TelepadExitPage
          }
          offset={props.offset}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE}px`}
        h={`${TILE_SIZE}px`}
        zIndex={TELEPAD_Z_INDEX}
      >
        {props.kind === "entrance" && (
          <img
            alt="telepad_entrance"
            src={SPRITE_URLS[props.telepadIndex].entrance}
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              marginLeft: "1px",
            }}
          />
        )}
        {props.kind === "exit" && (
          <img
            alt="telepad_exit"
            src={SPRITE_URLS[props.telepadIndex].exit}
            style={{
              width: `${TILE_SIZE - 2}px`,
              height: `${TILE_SIZE - 2}px`,
              marginTop: "1px",
              marginLeft: "1px",
            }}
          />
        )}
      </Box>
    </>
  );
}
