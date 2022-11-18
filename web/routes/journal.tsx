import { Link, useParams } from "react-router-dom";
import JournalSection, {
  sections,
  SectionName,
} from "../components/journal/journal_section";

export default function Journal() {
  let { sectionName } = useParams();

  // Default to the first section.
  sectionName ||= Object.keys(sections)[0] as SectionName;
  if (!(sectionName in sections)) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

  return (
    <>
      <div className="bg-gray-300 p-0 fixed top-0 left-0 w-screen h-screen -z-10"></div>
      <div className="lg:container lg:mx-auto px-8">
        <div className="flex flex-row">
          <div id="journal-sidebar" className="p-3 min-w-max">
            <h4 className="font-bold text-lg">Concepts</h4>
            {Object.keys(sections).map((linkName) => (
              <div key={linkName}>
                <Link to={`/journal/concepts/${linkName}`}>
                  <span
                    className={
                      linkName == sectionName
                        ? "underline "
                        : "" + "font-semibold hover:underline"
                    }
                  >
                    {linkName}
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div id="journal-main" className="bg-white p-4 px-8 min-h-[90vh]">
            <JournalSection section={sectionName as SectionName} />
          </div>
        </div>
      </div>
    </>
  );
}
