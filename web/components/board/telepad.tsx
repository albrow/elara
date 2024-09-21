import { Box, Image } from "@chakra-ui/react";
import { useMemo } from "react";

import { SPRITE_DROP_SHADOW, TELEPAD_Z_INDEX } from "../../lib/constants";
import telepadBlueEntranceUrl from "../../images/board/telepad_blue_entrance.png";
import telepadBlueExitUrl from "../../images/board/telepad_blue_exit.png";
import telepadGreenEntranceUrl from "../../images/board/telepad_green_entrance.png";
import telepadGreenExitUrl from "../../images/board/telepad_green_exit.png";
import telepadPurpleEntranceUrl from "../../images/board/telepad_purple_entrance.png";
import telepadPurpleExitUrl from "../../images/board/telepad_purple_exit.png";
import {
  Offset,
  getDefaultSpriteDims,
  getTileSize,
} from "../../lib/board_utils";
import TelepadExitPage from "./hover_info_pages/telepad_exit.mdx";
import TelepadEntrancePage from "./hover_info_pages/telepad_entrance.mdx";
import BoardHoverInfo from "./board_hover_info";

export type TelepadKind = "entrance" | "exit";

interface TelepadProps {
  offset: Offset;
  kind: TelepadKind;
  telepadIndex: number;
  enableHoverInfo: boolean;
  scale: number;
  filter?: string;
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
  const spriteDims = useMemo(
    () => getDefaultSpriteDims(props.scale),
    [props.scale]
  );
  const tileSize = useMemo(() => getTileSize(props.scale), [props.scale]);

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
          scale={props.scale}
        />
      )}
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${tileSize}px`}
        h={`${tileSize}px`}
        zIndex={TELEPAD_Z_INDEX}
        filter={props.filter}
      >
        <Image
          src={imgUrl}
          w={`${spriteDims.width}px`}
          h={`${spriteDims.height}px`}
          mt={`${spriteDims.marginTop}px`}
          ml={`${spriteDims.marginLeft}px`}
          filter={SPRITE_DROP_SHADOW}
        />
      </Box>
    </>
  );
}
