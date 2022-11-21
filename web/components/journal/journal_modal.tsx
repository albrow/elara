import { JOURNAL_MODAL_Z_INDEX } from "../../lib/constants";
import { JournalProps, SectionName } from "./journal_section";
import JournalSection from "./journal_section";

interface JournalModalProps extends JournalProps {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JournalModal(props: JournalModalProps) {
  return (
    <div hidden={!props.visible}>
      <div
        id="modal-overlay"
        style={{ zIndex: JOURNAL_MODAL_Z_INDEX }}
        className="fixed top-0 w-full h-full bg-black opacity-80"
        onClick={() => props.setVisible(false)}
      ></div>
      <div
        id="journal-outer"
        style={{ zIndex: JOURNAL_MODAL_Z_INDEX + 1 }}
        className="my-10 fixed w-full h-full"
      >
        <div
          id="journal-inner"
          className="bg-white drop-shadow-md border-black rounded-md max-w-[1200px] mx-auto p-1"
        >
          <div
            onClick={() => props.setVisible(false)}
            className="fixed right-5 top-4 text-2xl hover:cursor-pointer"
          >
            ✖
          </div>
          <div
            id="journal-scrollable"
            className="max-h-[82vh] overflow-y-scroll p-10"
          >
            <JournalSection {...props} />
          </div>
        </div>
      </div>
    </div>
  );
}
