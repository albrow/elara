import { useRouteNode, useRouter } from "react-router5";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Flex, Box, Text } from "@chakra-ui/react";
import { Unsubscribe } from "router5/dist/types/base";

import { MdArrowDownward } from "react-icons/md";
import { useSaveData } from "../hooks/save_data_hooks";
import { JOURNAL_SECTIONS, SectionName } from "../components/journal/sections";
import JournalSection from "../components/journal/journal_section";
import { TREES } from "../lib/dialog_trees";
import JournalSidebar from "../components/journal/journal_sidebar";
import {
  JOURNAL_HANDLES_Z_INDEX,
  SCROLL_INDICATOR_Z_INDEX,
} from "../lib/constants";
import {
  NAVBAR_HEIGHT_BASE,
  NAVBAR_RESPONSIVE_HEIGHT,
} from "../lib/responsive_design";
import { useDialogModal } from "../hooks/dialog_modal_hooks";

import journalBgImage from "../images/journal_bg_only.jpg";

const JOURNAL_CONTENT_PADDING = 20;

export default function Journal() {
  const { route } = useRouteNode("");
  const router = useRouter();
  const [saveData, { markJournalPageSeen }] = useSaveData();
  const [showDialogModal] = useDialogModal();
  const journalScrollbox = useRef<HTMLDivElement>(null);

  // Whether or not it is *possible* for the journal page to have a scrollbar.
  // This is purely based on the height of the screen and the content of the
  // journal page.
  const [mightHaveScrollIndicator, setMightHaveScrollIndicator] =
    useState(false);
  // Whether or not the "scroll for more" indicator should currently be shown.
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const sectionName = useMemo(() => {
    let name = route.params?.sectionName;
    // Default to the first section.
    name ||= Object.keys(JOURNAL_SECTIONS)[0] as SectionName;
    if (!(name in JOURNAL_SECTIONS)) {
      throw new Error(`Unknown section: ${name}`);
    }
    return name;
  }, [route.params?.sectionName]);

  // Mark the journal page as seen as soon as we navigate away from it.
  useEffect(() => {
    const unsubscribe = router.subscribe((_transition) => {
      markJournalPageSeen(sectionName!);
    }) as Unsubscribe;
    return unsubscribe;
  }, [markJournalPageSeen, router, sectionName]);

  const isScrollable = useCallback(
    (el: HTMLElement) => el.scrollHeight > el.clientHeight,
    []
  );

  useLayoutEffect(() => {
    if (sectionName) {
      document.title = `Elara | Journal: ${sectionName}`;
    } else {
      document.title = "Elara | Journal";
    }
    // Scroll to the top of the page when loading a new
    // journal section.
    window.scrollTo({
      behavior: "instant" as ScrollBehavior,
      top: 0,
      left: 0,
    });

    // If there is more content below the scrollbar, show an indicator.
    // Then automatically hide it after the user scrolls.
    if (journalScrollbox.current) {
      const scrollbox = journalScrollbox.current;

      // Scroll to the top of the scrollbox so the top of the journal
      // page is visible to start.
      scrollbox.scrollTo({
        behavior: "instant" as ScrollBehavior,
        top: 0,
        left: 0,
      });

      // If the scrollbox is scrollable, show the indicator.
      if (isScrollable(scrollbox)) {
        setMightHaveScrollIndicator(true);
        setShowScrollIndicator(true);
        const hideIndicator = () => {
          if (scrollbox.scrollTop !== 0) {
            setShowScrollIndicator(false);
            scrollbox.removeEventListener("scroll", hideIndicator);
          }
        };
        scrollbox.addEventListener("scroll", hideIndicator);
        return () => {
          // Clean up event listener.
          scrollbox.removeEventListener("scroll", hideIndicator);
        };
      }
      setMightHaveScrollIndicator(false);
      setShowScrollIndicator(false);
    } else {
      setMightHaveScrollIndicator(false);
      setShowScrollIndicator(false);
    }

    return () => {};
  }, [isScrollable, sectionName]);

  const dialogTreeName = useMemo(() => {
    const name = `journal_${sectionName}`;
    if (!(name in TREES)) {
      // There is no dialog tree for this level.
      return null;
    }
    return name;
  }, [sectionName]);

  const shouldShowDialogTree = useCallback(
    () =>
      dialogTreeName !== null &&
      !saveData.seenDialogTrees.includes(dialogTreeName),
    [dialogTreeName, saveData.seenDialogTrees]
  );

  useEffect(() => {
    if (shouldShowDialogTree() && dialogTreeName != null) {
      showDialogModal(dialogTreeName);
    }
  });

  return (
    <Box
      mt={NAVBAR_RESPONSIVE_HEIGHT}
      bgImage={`url("${journalBgImage}")`}
      bgRepeat="no-repeat"
      bgSize="cover"
      w="100%"
      h="100%"
      position="fixed"
      pt={{ base: "10px", xl: "16px", "2xl": "32px" }}
      pb={{ base: "0px", xl: "8px", "2xl": "16px" }}
      overflowX="scroll"
    >
      <Flex
        mx="auto"
        w="fit-content"
        maxW="100%"
        h="100%"
        minH="500px"
        minW="600px"
      >
        {/* Left handle */}
        <Box
          w="60px"
          bg="#202E29"
          h="30%"
          maxH="300px"
          minH="200px"
          mt="33vh"
          borderLeftRadius="20px"
          border="1px solid black"
          borderRight="none"
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
          zIndex={JOURNAL_HANDLES_Z_INDEX}
        />
        {/* Main journal body */}
        <Box
          bg="gray.300"
          border="16px solid #758DA1"
          borderRadius="5px"
          w="100%"
          // maxW={{
          //   xl: "container.xl",
          //   "2xl": "container.2xl",
          //   "3xl": "container.3xl",
          // }}
          maxW="1500px"
          h={{
            base: `calc(100% - ${NAVBAR_HEIGHT_BASE}px)`,
            // "2xl": `calc(100% - ${NAVBAR_HEIGHT_2XL}px)`,
            // "3xl": `calc(100% - ${NAVBAR_HEIGHT_3XL}px)`,
          }}
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
        >
          <Flex h="100%">
            <Box h="100%" w="fit-content">
              <JournalSidebar />
            </Box>
            <Box
              ref={journalScrollbox}
              bg="white"
              p={`${JOURNAL_CONTENT_PADDING}px`}
              border="1px solid"
              borderTop="none"
              borderBottom="none"
              borderColor="gray.400"
              h="100%"
              overflowY="auto"
            >
              <JournalSection section={sectionName as SectionName} />
              {mightHaveScrollIndicator && (
                <Box
                  bgImage="linear-gradient(rgba(0, 0, 0, 0), var(--chakra-colors-gray-800) 80%)"
                  height="fit-content"
                  position="sticky"
                  bottom={`-${JOURNAL_CONTENT_PADDING}px`}
                  mr={`-${JOURNAL_CONTENT_PADDING}px`}
                  ml={`-${JOURNAL_CONTENT_PADDING}px`}
                  opacity={showScrollIndicator ? 1 : 0}
                  transition="opacity 0.5s ease-in-out, visibility 0.5s ease-in-out"
                  zIndex={SCROLL_INDICATOR_Z_INDEX}
                  visibility={showScrollIndicator ? "visible" : "hidden"}
                >
                  <Text
                    textAlign="center"
                    lineHeight={{
                      base: "32px",
                      // "2xl": "40px",
                      // "3xl": "52px",
                    }}
                    pt={{
                      base: "16px",
                      // "2xl": "20px",
                      // "3xl": "26px",
                    }}
                    color="white"
                    // fontSize={BODY_RESPONSIVE_FONT_SCALE}
                  >
                    <MdArrowDownward
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        marginRight: "4px",
                        marginBottom: "2px",
                      }}
                    />
                    Scroll for more
                    <MdArrowDownward
                      style={{
                        display: "inline-block",
                        verticalAlign: "middle",
                        marginLeft: "4px",
                        marginBottom: "2px",
                      }}
                    />
                  </Text>
                </Box>
              )}
            </Box>
          </Flex>
        </Box>

        {/* Right handle */}
        <Box
          w="60px"
          bg="#202E29"
          h="30%"
          maxH="300px"
          mt="33vh"
          borderRightRadius="20px"
          border="1px solid black"
          borderLeft="none"
          boxShadow="0 5px 12px 5px rgba(0, 0, 0, 0.5)"
          zIndex={JOURNAL_HANDLES_Z_INDEX}
        />
      </Flex>
    </Box>
  );
}
