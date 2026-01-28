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
          <Text fontWeight="bold">Предупреждение</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Точно начать новую игру? Все существующие данные сохранения будут
            удалены, и вы начнёте с нуля. Это действие нельзя отменить.
          </Text>
          <Flex w="100%" mt="30px" gap="5px" justifyContent="right">
            <Button
              colorScheme="blackAlpha"
              onClick={() => props.setVisible(false)}
            >
              <MdOutlineCancel style={{ marginRight: "0.3em" }} />
              Отмена
            </Button>
            <Button colorScheme="red" onClick={props.onConfirm}>
              <MdOutlineDeleteForever style={{ marginRight: "0.3em" }} />
              Начать новую игру
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
