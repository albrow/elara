import { Box } from "@chakra-ui/react";

export interface SpriteLabelProps {
  zIndex: number;
  value: string | number;
}

export default function SpriteLabel(props: SpriteLabelProps) {
  return (
    <Box
      color="white"
      fontWeight="extrabold"
      position="relative"
      top={-4}
      right={0}
      fontSize="xs"
      style={{ zIndex: props.zIndex }}
      w="fit-content"
      rounded="md"
      textAlign="right"
      textShadow="0px 0px 3px black"
    >
      {props.value}
    </Box>
  );
}
