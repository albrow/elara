import { Box } from "@chakra-ui/react";

export interface SpriteLabelProps {
  zIndex: number;
  value: string | number;
}

export default function SpriteLabel(props: SpriteLabelProps) {
  return (
    <Box
      color="orange.300"
      fontWeight="extrabold"
      position="relative"
      top={-5}
      right={0}
      fontSize="sm"
      w="fit-content"
      textShadow="0px 0px 3px black"
      zIndex={props.zIndex}
      style={{
        WebkitTextStroke: "0.5px black",
      }}
    >
      {props.value}
    </Box>
  );
}
