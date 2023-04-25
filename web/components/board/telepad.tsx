import { Box } from "@chakra-ui/react";
import { Offset } from "../../lib/utils";
import { TELEPAD_Z_INDEX, TILE_SIZE } from "../../lib/constants";

import telepadGreenEntranceUrl from "../../images/telepad_green_entrance.png";
import telepadGreenExitUrl from "../../images/telepad_green_exit.png";
import telepadPurpleEntranceUrl from "../../images/telepad_purple_entrance.png";
import telepadPurpleExitUrl from "../../images/telepad_purple_exit.png";

export type TelepadKind = "entrance" | "exit";

interface TelepadProps {
  offset: Offset;
  kind: TelepadKind;
  telepadIndex: number;
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
];

export default function Telepad(props: TelepadProps) {
  return (
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
          className="telepad sprite"
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
          className="telepad sprite"
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
  );
}
