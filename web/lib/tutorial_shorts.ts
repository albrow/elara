import howToRunCodeUrl from "../images/shorts/how_to_run_code.gif";
import howToPauseAndStepUrl from "../images/shorts/how_to_pause_and_step.gif";
import howToSeeErrorsUrl from "../images/shorts/how_to_see_errors.gif";

export interface TutorialShort {
  title: string;
  text: string;
  imageUrl: string;
}

export const SHORTS: { [key: string]: TutorialShort } = {
  how_to_run_code: {
    title: "How to run code",
    text: "Click the run button to run your code. The code will cause the rover to move around and do things.",
    imageUrl: howToRunCodeUrl,
  },
  how_to_pause_and_step: {
    title: "One step at a time",
    text: "Click the pause button to pause your code while it is running. Then you can use adjacent buttons to run the code one step at a time.",
    imageUrl: howToPauseAndStepUrl,
  },
  how_to_see_errors: {
    title: "Error messages",
    text: "Sometimes your code may have an error. Don't worry, even the best coders get errors sometimes! If you hover over the red dot, you can see more information about the error.",
    imageUrl: howToSeeErrorsUrl,
  },
};

export type ShortId = keyof typeof SHORTS;
