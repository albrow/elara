import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { MdOutlineCancel, MdOutlineDeleteForever } from "react-icons/md";

export interface ConfirmDeleteExistingDataModalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
}

export default function ConfirmDeleteExistingDataModal(
  props: ConfirmDeleteExistingDataModalProps
) {
  return (
    <Modal
      isOpen={props.visible}
      onClose={() => props.setVisible(false)}
      autoFocus={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text fontWeight="bold">Warning</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to start a new game? Any existing save data
            will be deleted and you will start over from scratch. This cannot be
            undone.
          </Text>
          <Flex w="100%" mt="30px" gap="5px" justifyContent="right">
            <Button
              colorScheme="blackAlpha"
              onClick={() => props.setVisible(false)}
            >
              <MdOutlineCancel style={{ marginRight: "0.3em" }} />
              Cancel
            </Button>
            <Button colorScheme="red" onClick={props.onConfirm}>
              <MdOutlineDeleteForever style={{ marginRight: "0.3em" }} />
              Start New Game
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
