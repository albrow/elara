import { Badge, Flex } from "@chakra-ui/react";
import { MdOutlineTimer, MdOutlineTextSnippet } from "react-icons/md";
import { BsLightningChargeFill } from "react-icons/bs";
import { Animate } from "react-simple-animate";

import { ScriptStats } from "../../../../elara-lib/pkg/elara_lib";

export interface StatsProps {
  stats: ScriptStats;
  // The sequenceIndex to start the animation elements at. Subsequent elements
  // within this component may use animIndexStart + 1, animIndexStart + 2, etc.
  animIndexStart: number;
}

export default function ModalStats(props: StatsProps) {
  return (
    <Flex mx="auto" my="18px" w="fit-content">
      <Animate
        sequenceIndex={props.animIndexStart}
        delay={0.2}
        start={{ opacity: 0 }}
        end={{ opacity: 1 }}
      >
        <Badge colorScheme="purple" px="9px" py="3px" fontSize="sm" mr="5px">
          <Flex direction="row" mt="0.12rem">
            <MdOutlineTimer
              size="1.2em"
              style={{
                marginRight: "0.1rem",
                marginTop: "0.1rem",
              }}
            />
            {`Time: ${props.stats.time_taken} steps`}
          </Flex>
        </Badge>
      </Animate>
      <Animate
        sequenceIndex={props.animIndexStart + 1}
        delay={0.05}
        start={{ opacity: 0 }}
        end={{ opacity: 1 }}
      >
        <Badge colorScheme="blue" px="9px" py="3px" fontSize="sm" mr="5px">
          <Flex direction="row" mt="0.12rem">
            <BsLightningChargeFill
              size="1.2em"
              style={{
                marginRight: "0.1rem",
                marginTop: "0.1rem",
              }}
            />
            {`Energy Used: ${props.stats.energy_used}`}
          </Flex>
        </Badge>
      </Animate>
      <Animate
        sequenceIndex={props.animIndexStart + 2}
        delay={0.05}
        start={{ opacity: 0 }}
        end={{ opacity: 1 }}
      >
        <Badge colorScheme="green" px="9px" py="3px" fontSize="sm">
          <Flex direction="row" mt="0.12rem">
            <MdOutlineTextSnippet
              size="1.2em"
              style={{
                marginRight: "0.1rem",
                marginTop: "0.1rem",
              }}
            />
            {`Code Length: ${props.stats.code_len}`}
          </Flex>
        </Badge>
      </Animate>
    </Flex>
  );
}
