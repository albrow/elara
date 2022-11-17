import { JOURNAL_POP_OVER_Z_INDEX } from "../../lib/constants";
import Journal, { JournalProps } from "./journal";

interface JournalPopOverProps extends JournalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function JournalPopOver(props: JournalPopOverProps) {
  return (
    <>
      <div
        id="journal-pop-over"
        className={
          (props.show ? "" : "hidden") + " fixed top-15 left-0 w-screen"
        }
        style={{ zIndex: JOURNAL_POP_OVER_Z_INDEX }}
      >
        <div className="container mx-auto my-4">
          <div className="max-h-[85vh] overflow-y-auto xl:mx-10 sm:mx-4 bg-yellow-100 border border-gray-700 rounded-lg drop-shadow-md">
            <div
              id="journal-close"
              className="absolute right-0 p-1 px-4 text-2xl hover:cursor-pointer"
              onClick={() => props.setShow(false)}
            >
              𝘅
            </div>
            <Journal section={props.section} setSection={props.setSection} />
          </div>
        </div>
      </div>
    </>
  );
}
