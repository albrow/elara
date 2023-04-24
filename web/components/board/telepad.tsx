import { Box } from "@chakra-ui/react";
import { TbDoorEnter, TbDoorExit } from "react-icons/tb";

import { Offset } from "../../lib/utils";
import { TELEPAD_Z_INDEX, TILE_SIZE } from "../../lib/constants";

export type TelepadKind = "entrance" | "exit";

interface TelepadProps {
  offset: Offset;
  kind: TelepadKind;
}

export default function Telepad(props: TelepadProps) {
  return (
    <Box
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      w={`${TILE_SIZE - 1}px`}
      h={`${TILE_SIZE - 1}px`}
      zIndex={TELEPAD_Z_INDEX}
    >
      <Box
        bg="white"
        borderRadius="100px"
        borderColor="yellow.400"
        borderWidth="2px"
        p="5px"
        w="40px"
        h="40px"
        margin="auto"
        mt="5px"
      >
        {props.kind === "entrance" && (
          <TbDoorEnter
            size="28px"
            color="var(--chakra-colors-cyan-600)"
            style={{
              // Flip horizontal so it lines up with the exit icon.
              transform: "scaleX(-1)",
              margin: "auto",
            }}
          />
        )}
        {props.kind === "exit" && (
          <TbDoorExit
            size="28px"
            color="var(--chakra-colors-cyan-600)"
            style={{
              margin: "auto",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
