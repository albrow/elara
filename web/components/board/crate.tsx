import { Image } from "@chakra-ui/react";

import { useMemo } from "react";
import { SPRITE_DROP_SHADOW, CRATE_Z_INDEX } from "../../lib/constants";
import redCrateImgUrl from "../../images/board/crate_red.png";
import blueCrateImgUrl from "../../images/board/crate_blue.png";
import greenCrateImgUrl from "../../images/board/crate_green.png";
import { Offset } from "../../lib/utils";

interface CrateProps {
  offset: Offset;
  color: "red" | "blue" | "green";
  held: boolean;
}

export default function Crate(props: CrateProps) {
  const imgUrl = useMemo(() => {
    switch (props.color) {
      case "red":
        return redCrateImgUrl;
      case "blue":
        return blueCrateImgUrl;
      case "green":
        return greenCrateImgUrl;
      default:
        throw new Error(`Invalid crate color: ${props.color}`);
    }
  }, [props.color]);

  return (
    <Image
      alt=""
      src={imgUrl}
      w="48px"
      h="48px"
      mt="1px"
      ml="1px"
      position="absolute"
      left={props.offset.left}
      top={props.offset.top}
      zIndex={CRATE_Z_INDEX}
      filter={SPRITE_DROP_SHADOW}
    />
  );
}
