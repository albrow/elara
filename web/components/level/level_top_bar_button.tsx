import { Button } from "@chakra-ui/react";

export interface LevelTopBarButtonProps {
  onClick: () => void;
}

export default function LevelTopBarButton(
  props: React.PropsWithChildren<LevelTopBarButtonProps>
) {
  return (
    <Button
      ml={{ base: "6px", xl: "8px" }}
      size="xs"
      fontSize="xs"
      _hover={{ bg: "gray.900", color: "white" }}
      _active={{ bg: "gray.600" }}
      rounded={{ base: "3px", xl: "md" }}
      onClick={props.onClick}
      variant="outline"
    >
      {props.children}
    </Button>
  );
}
