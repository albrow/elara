import { Box, Image } from "@chakra-ui/react";
import { useMemo } from "react";

import { SPRITE_DROP_SHADOW, TELEPAD_Z_INDEX } from "../../lib/constants";
import telepadBlueEntranceUrl from "../../images/board/telepad_blue_entrance.png";
import telepadBlueExitUrl from "../../images/board/telepad_blue_exit.png";
import telepadGreenEntranceUrl from "../../images/board/telepad_green_entrance.png";
import telepadGreenExitUrl from "../../images/board/telepad_green_exit.png";
import telepadPurpleEntranceUrl from "../../images/board/telepad_purple_entrance.png";
import telepadPurpleExitUrl from "../../images/board/telepad_purple_exit.png";
import { Offset } from "../../lib/utils";
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
          offset={props.offset}
        />
      )}
      <Box>
        <Image
          alt="telepad_entrance"
          src={imgUrl}
          position="absolute"
          left={props.offset.left}
          top={props.offset.top}
          w="48px"
          h="48px"
          mt="1px"
          ml="1px"
          zIndex={TELEPAD_Z_INDEX}
          filter={SPRITE_DROP_SHADOW}
        />
      </Box>
    </>
  );
}
