import howToRunCodeUrl from "../images/shorts/how_to_run_code.gif";
import howToPauseAndStepUrl from "../images/shorts/how_to_pause_and_step.gif";
import howToSeeErrorsUrl from "../images/shorts/how_to_see_errors.gif";
import whereToFindObjectivesUrl from "../images/shorts/where_to_find_objectives.gif";
import backToHubUrl from "../images/shorts/back_to_hub.gif";
import movingTakesEnergyUrl from "../images/shorts/moving_takes_energy.gif";
import howToGetMoreEnergyUrl from "../images/shorts/how_to_get_more_energy.gif";
import howToViewFunctionListUrl from "../images/shorts/how_to_view_function_list.gif";
import extraChallengesUrl from "../images/shorts/extra_challenges.gif";
import showHintsAndDialogUrl from "../images/shorts/show_hints_and_dialog.gif";
import hoverOverTextUrl from "../images/shorts/hover_over_text.gif";
import hoverOverBoardUrl from "../images/shorts/hover_over_board.gif";

export interface TutorialShort {
  title: string;
  text: string;
  imageUrl: string;
}

export const SHORTS: { [key: string]: TutorialShort } = {
  how_to_run_code: {
    title: "How to run code",
    text: `Press "Deploy" and then "Play" to run your code. The code will cause the rover to move around and do things.`,
    imageUrl: howToRunCodeUrl,
  },
  how_to_pause_and_step: {
    title: "One step at a time",
    text: "You can use the buttons or drag the slider to step forward or backward through your code. This is useful for slowing things down or skipping ahead.",
    imageUrl: howToPauseAndStepUrl,
  },
  how_to_see_errors: {
    title: "Error messages",
    text: "Even the best coders get errors sometimes! If you hover over the red dot, you can see more information about the error.",
    imageUrl: howToSeeErrorsUrl,
  },
  where_to_find_objectives: {
    title: "Objectives",
    text: "You can find the current objective near the top of the screen. Usually you will need to move the rover to the goal, but sometimes you may need to do something else.",
    imageUrl: whereToFindObjectivesUrl,
  },
  back_to_hub: {
    title: "Going back to the hub",
    text: 'You can go back to the hub at anytime by pressing the "Hub" button. From there, you can revisit previous levels or look at the journal.',
    imageUrl: backToHubUrl,
  },
  moving_takes_energy: {
    title: "Energy",
    text: "The little number next to G.R.O.V.E.R. shows his current amount of energy. Moving him uses one energy per space.",
    imageUrl: movingTakesEnergyUrl,
  },
  how_to_get_more_energy: {
    title: "How to get more energy",
    text: "If you run out of energy, you won't be able to complete the objective. You can get more energy by collecting an energy cell.",
    imageUrl: howToGetMoreEnergyUrl,
  },
  how_to_view_function_list: {
    title: "List of available functions",
    text: `You can view the list of available functions for any level by pressing the "function list" button.`,
    imageUrl: howToViewFunctionListUrl,
  },
  extra_challenges: {
    title: "Extra challenges",
    text: "Some levels have optional challenges, but don't worry if you can't do them right away. You can always try again later!",
    imageUrl: extraChallengesUrl,
  },
  show_hints_and_dialog: {
    title: "Hints and dialog",
    text: 'If you\'re feeling stuck, you can press the "Show hints" button near the top of the screen to get a hint. If a level has dialog, you can also press the "Show dialog" button to see the dialog again.',
    imageUrl: showHintsAndDialogUrl,
  },
  hover_over_text: {
    title: "Hover over functions",
    text: "If you hover over a function that is highlighted in purple, you can learn more about how it works and see some examples.",
    imageUrl: hoverOverTextUrl,
  },
  hover_over_board: {
    title: "Hover over the board",
    text: "You can also hover over the board to see more info on the different things G.R.O.V.E.R. can interact with.",
    imageUrl: hoverOverBoardUrl,
  },
};

export type ShortId = keyof typeof SHORTS;
