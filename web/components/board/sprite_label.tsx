import { Box } from "@chakra-ui/react";

export interface SpriteLabelProps {
  zIndex: number;
  value: string | number;
}

export default function SpriteLabel(props: SpriteLabelProps) {
  return (
    <Box
      color="cyan.300"
      fontWeight="900"
      position="relative"
      top="-16px"
      right="2px"
      fontSize="0.8em"
      w="100%"
      textShadow="0px 0px 2px black"
      zIndex={props.zIndex}
      textAlign="right"
      style={{
        WebkitTextStroke: "0.5px var(--chakra-colors-cyan-700)",
      }}
    >
      {props.value}
    </Box>
  );
}
