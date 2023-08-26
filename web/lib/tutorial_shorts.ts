import howToRunCodeUrl from "../images/shorts/how_to_run_code.gif";
import howToPauseAndStepUrl from "../images/shorts/how_to_pause_and_step.gif";
import howToSeeErrorsUrl from "../images/shorts/how_to_see_errors.gif";
import whereToFindObjectivesUrl from "../images/shorts/where_to_find_objectives.gif";
import backToHubUrl from "../images/shorts/back_to_hub.gif";
import movingTakesEnergyUrl from "../images/shorts/moving_takes_energy.gif";
import howToGetMoreEnergyUrl from "../images/shorts/how_to_get_more_energy.gif";
import howToViewFunctionListUrl from "../images/shorts/how_to_view_function_list.gif";
import extraChallengesUrl from "../images/shorts/extra_challenges.gif";

export interface TutorialShort {
  title: string;
  text: string;
  imageUrl: string;
}

export const SHORTS: { [key: string]: TutorialShort } = {
  how_to_run_code: {
    title: "How to run code",
    text: `Press "deploy" and then "play" to run your code. The code will cause the rover to move around and do things.`,
    imageUrl: howToRunCodeUrl,
  },
  how_to_pause_and_step: {
    title: "One step at a time",
    text: "Alternatively, you can use the buttons or the slider to step through your code one step at a time.",
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
};

export type ShortId = keyof typeof SHORTS;
