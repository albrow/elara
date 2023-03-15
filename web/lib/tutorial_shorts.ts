import howToRunCodeUrl from "../images/shorts/how_to_run_code.gif";
import howToPauseAndStepUrl from "../images/shorts/how_to_pause_and_step.gif";
import howToSeeErrorsUrl from "../images/shorts/how_to_see_errors.gif";
import whereToFindObjectivesUrl from "../images/shorts/where_to_find_objectives.gif";
import howToNavigateScenesUrl from "../images/shorts/how_to_navigate_scenes.gif";
import movingTakesFuelUrl from "../images/shorts/moving_takes_fuel.gif";
import howToGetMoreFuelUrl from "../images/shorts/how_to_get_more_fuel.gif";
import howToUseDataTerminalsUrl from "../images/shorts/how_to_use_data_terminals.gif";
import howToViewFunctionListUrl from "../images/shorts/how_to_view_function_list.gif";

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
  how_to_navigate_scenes: {
    title: "Going back to a previous page",
    text: 'You can use the "journal" and "levels" dropdowns near the top of the screen to go back to a previous page at any time.',
    imageUrl: howToNavigateScenesUrl,
  },
  moving_takes_fuel: {
    title: "Fuel",
    text: "The little orange number shows the rover's current amount of fuel. Moving the rover uses one fuel per space.",
    imageUrl: movingTakesFuelUrl,
  },
  how_to_get_more_fuel: {
    title: "How to get more fuel",
    text: "If you run out of fuel, you won't be able to complete the objective. You can get more fuel by simply moving into a space that contains it.",
    imageUrl: howToGetMoreFuelUrl,
  },
  how_to_use_data_terminals: {
    title: "Reading data from terminals",
    text: "Data terminals can hold lots of different kinds of information. You can read data from a terminal by moving the rover next to it and then using the read_data function.",
    imageUrl: howToUseDataTerminalsUrl,
  },
  how_to_view_function_list: {
    title: "List of available functions",
    text: `You can view the list of available functions for any level by pressing the "function list" button.`,
    imageUrl: howToViewFunctionListUrl,
  },
};

export type ShortId = keyof typeof SHORTS;
