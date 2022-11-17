import { SectionName } from "./journal";

export interface OpenJournalLinkProps {
  section: SectionName;
  setSection: React.Dispatch<React.SetStateAction<SectionName>>;
  setShowJournal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function OpenJournalLink(props: OpenJournalLinkProps) {
  return (
    <span
      className="hover:cursor-pointer hover:underline text-blue-700 active:text-blue-800"
      onClick={() => {
        props.setSection(props.section);
        props.setShowJournal(true);
      }}
    >
      {props.section[0].toUpperCase() + props.section.slice(1)}
    </span>
  );
}
