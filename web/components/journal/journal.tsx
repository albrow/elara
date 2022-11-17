import { useState } from "react";

import Functions from "./sections/functions.mdx";
import Comments from "./sections/comments.mdx";
import "./journal.css";

export const sections = {
  functions: Functions,
  comments: Comments,
};

export type SectionName = keyof typeof sections;

export interface JournalProps {
  section: SectionName;
  setSection: React.Dispatch<React.SetStateAction<SectionName>>;
}

function InternalSectionLink(
  section: SectionName,
  setSection: React.Dispatch<React.SetStateAction<SectionName>>
) {
  return (
    <div
      key={section}
      className="hover:cursor-pointer text-sm hover:underline active:text-gray-200 mb-1"
      onClick={() => setSection(section)}
    >
      {section[0].toUpperCase() + section.slice(1)}
    </div>
  );
}

export default function Journal(props: JournalProps) {
  const SectionComponent = sections[props.section];

  return (
    <>
      <div className="flex flex-row">
        <div
          id="journal-side-bar"
          className="bg-yellow-900 rounded-l-md p-4 border-r-2 border-yellow-300 text-white"
        >
          <div className="text-lg font-bold mb-2">Concepts</div>
          {Object.keys(sections).map((section) =>
            InternalSectionLink(section as SectionName, props.setSection)
          )}
        </div>
        <div id="journal-content" className="p-3 pb-6">
          <SectionComponent />
        </div>
      </div>
    </>
  );
}
