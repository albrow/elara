import { RunResult } from "../../elara-lib/pkg/elara_lib";

export interface LevelEndProps {
  isCompleted: boolean;
  modalKind: "success" | "failure";
  modalTitle: string;
  modalMessage: string;
}

export function getLevelEndProps(
  result: RunResult,
  challenge: string
): LevelEndProps {
  switch (result.outcome) {
    case "no_objective":
      return {
        isCompleted: true,
        modalKind: "success",
        modalTitle: "Great Job!",
        modalMessage:
          "You completed the objective! You can replay this level if you want or move on to the next one.",
      };
    case "success":
      if (challenge === "") {
        // Level does not have a challenge.
        return {
          isCompleted: true,
          modalKind: "success",
          modalTitle: "Great Job!",
          modalMessage:
            "You completed the objective! You can replay this level if you want or move on to the next one.",
        };
      }
      if (!result.passes_challenge) {
        // Level has a challenge and the user failed it.
        return {
          isCompleted: true,
          modalKind: "success",
          modalTitle: "Great Job!",
          modalMessage:
            "You completed the objective! There's an optional extra challenge you can try, or you can move on to the next level.",
        };
      }
      // Level has a challenge and the user passed it.
      return {
        isCompleted: true,
        modalKind: "success",
        modalTitle: "Fantastic!",
        modalMessage: "Wow! You passed the extra challenge!",
      };
    case "continue":
      return {
        isCompleted: false,
        modalKind: "failure",
        modalTitle: "Keep Going!",
        modalMessage:
          "You didn't quite complete the objective, but you're on the right track!",
      };
    default:
      return {
        isCompleted: false,
        modalKind: "failure",
        modalTitle: "Uh Oh!",
        modalMessage: result.outcome,
      };
  }
}
