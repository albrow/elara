import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "made_it_to_server_room_1"
  | "made_it_to_server_room_2"
  | "confirm_no_other_way"
  | "server_room_data_points_1"
  | "server_room_data_points_2"
  | "remind_how_to_read_data_points_1"
  | "remind_how_to_read_data_points_2"
  | "server_room_final_confirmation";
export type ChoiceIds =
  | "ask_no_other_way"
  | "ready_to_shutdown"
  | "ask_how_to_read_server_room_data_points"
  | "ack_server_room_data_points"
  | "ack_final_server_room_confirmation";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  made_it_to_server_room_1: {
    text: "Welp... this is it. You made it to the server room inside Moonbase Alpha.",
    choiceIds: [],
    nextId: "made_it_to_server_room_2",
  },
  made_it_to_server_room_2: {
    text: "All you have to do now is press the emergency shutdown button, which will disable all the rovers on Elara. Are you ready?",
    choiceIds: ["ask_no_other_way", "ready_to_shutdown"],
  },
  confirm_no_other_way: {
    text: "Afraid not. The only way to stop the malfunctioning rovers is to shut them all down.",
    choiceIds: ["ready_to_shutdown"],
  },
  server_room_data_points_1: {
    text: "By the way, if you come across some data points in the server room, you could try reading them.",
    choiceIds: [],
    nextId: "server_room_data_points_2",
  },
  server_room_data_points_2: {
    text: "Moonbase Alpha is the oldest building on Elara, and these data points can contain some interesting messages from the engineers who originally built it.",
    choiceIds: [
      "ask_how_to_read_server_room_data_points",
      "ack_server_room_data_points",
    ],
  },
  remind_how_to_read_data_points_1: {
    text: "All you have to do is move G.R.O.V.E.R. next to a data point and then call `say(read_data());`.",
    choiceIds: [],
    nextId: "remind_how_to_read_data_points_2",
  },
  remind_how_to_read_data_points_2: {
    text: "Just like with the hummus recipe. Remember?",
    choiceIds: [],
    nextId: "server_room_final_confirmation",
  },
  server_room_final_confirmation: {
    text: "Nothing left to do but press the button.",
    choiceIds: [
      "ask_how_to_read_server_room_data_points",
      "ack_final_server_room_confirmation",
    ],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  ask_no_other_way: {
    text: "Are you sure there's no other way?",
    nextId: "confirm_no_other_way",
  },
  ready_to_shutdown: {
    text: "I'm ready.",
    nextId: "server_room_data_points_1",
  },
  ask_how_to_read_server_room_data_points: {
    text: "How do I read from a data point again?",
    nextId: "remind_how_to_read_data_points_1",
  },
  ack_server_room_data_points: {
    text: "Good idea. I'll check it out!",
    nextId: "server_room_final_confirmation",
  },
  ack_final_server_room_confirmation: {
    text: "Okay... here goes nothing.",
  },
};

export const TREES: DialogTrees = {
  level_server_room: {
    name: "Shutting Down",
    startId: "made_it_to_server_room_1",
  },
};
