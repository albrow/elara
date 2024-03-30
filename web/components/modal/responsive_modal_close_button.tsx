import { ModalCloseButton } from "@chakra-ui/react";
/**
 * A wrapper to handle responsiveness for the modal close button.
 * I've tried using responsive objects for the size prop
 * but it did not work as expected.
 */
export function ResponsiveModalCloseButton() {
  // const windowWidth = useWindowWidth();

  // const size = useMemo(() => {
  //     if (windowWidth >= BP_3XL) {
  //         return 'lg';
  //     }
  //     if (windowWidth >= BP_2XL) {
  //         return 'md';
  //     }
  //     return 'sm';
  // }, [windowWidth]);

  return <ModalCloseButton size="sm" />;
}
