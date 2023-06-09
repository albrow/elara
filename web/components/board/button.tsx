import { IoMdRadioButtonOn, IoIosRadioButtonOn } from "react-icons/io";
import { Box } from "@chakra-ui/react";
import { Offset } from "../../lib/utils";
import { BUTTON_Z_INDEX, TILE_SIZE } from "../../lib/constants";
import BoardHoverInfo from "./board_hover_info";
import ButtonPage from "./hover_info_pages/button.mdx";

interface ButtonProps {
  offset: Offset;
  currentlyPressed: boolean;
  additionalInfo: string;
  // fuzzy: boolean;
}

// TODO(albrow): Draw connections on the UI between button and whatever
// it is connected to.
export default function Button(props: ButtonProps) {
  return (
    <>
      <BoardHoverInfo
        page={ButtonPage}
        offset={props.offset}
        additionalInfo={props.additionalInfo}
      />
      <Box
        position="absolute"
        left={props.offset.left}
        top={props.offset.top}
        w={`${TILE_SIZE - 1}px`}
        h={`${TILE_SIZE - 1}px`}
        zIndex={BUTTON_Z_INDEX}
        pt="5px"
      >
        {props.currentlyPressed ? (
          <IoMdRadioButtonOn
            size="40px"
            color="var(--chakra-colors-blue-500)"
            style={{
              margin: "auto",
            }}
          />
        ) : (
          <IoIosRadioButtonOn
            size="40px"
            color="var(--chakra-colors-blue-500)"
            style={{
              margin: "auto",
            }}
          />
        )}
      </Box>
    </>
  );
}
