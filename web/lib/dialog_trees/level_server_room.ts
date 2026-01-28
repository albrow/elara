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
    text: "Что ж... вот и всё. Ты добрался до серверной комнаты на Лунной базе Альфа.",
    choiceIds: [],
    nextId: "made_it_to_server_room_2",
  },
  made_it_to_server_room_2: {
    text: "Осталось только нажать кнопку аварийного отключения, которая выключит всех роверов на Эларе. Ты готов?",
    choiceIds: ["ask_no_other_way", "ready_to_shutdown"],
  },
  confirm_no_other_way: {
    text: "Боюсь, что нет. Единственный способ остановить неисправных роверов — это отключить их всех.",
    choiceIds: ["ready_to_shutdown"],
  },
  server_room_data_points_1: {
    text: "Кстати, если ты встретишь в серверной комнате какие-нибудь точки данных, можешь попробовать их прочитать.",
    choiceIds: [],
    nextId: "server_room_data_points_2",
  },
  server_room_data_points_2: {
    text: "Лунная база Альфа — самое старое здание на Эларе, и эти точки данных могут содержать интересные сообщения от инженеров, которые изначально её построили.",
    choiceIds: [
      "ask_how_to_read_server_room_data_points",
      "ack_server_room_data_points",
    ],
  },
  remind_how_to_read_data_points_1: {
    text: "Всё, что тебе нужно сделать — это подвести Г.Р.О.В.Е.Р.а к точке данных и вызвать `say(read_data());`.",
    choiceIds: [],
    nextId: "remind_how_to_read_data_points_2",
  },
  remind_how_to_read_data_points_2: {
    text: "Как с рецептом хумуса. Помнишь?",
    choiceIds: [],
    nextId: "server_room_final_confirmation",
  },
  server_room_final_confirmation: {
    text: "Осталось только нажать кнопку.",
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
    text: "Ты уверена, что другого способа нет?",
    nextId: "confirm_no_other_way",
  },
  ready_to_shutdown: {
    text: "Я готов.",
    nextId: "server_room_data_points_1",
  },
  ask_how_to_read_server_room_data_points: {
    text: "Как мне снова прочитать данные из точки данных?",
    nextId: "remind_how_to_read_data_points_1",
  },
  ack_server_room_data_points: {
    text: "Хорошая идея. Я посмотрю!",
    nextId: "server_room_final_confirmation",
  },
  ack_final_server_room_confirmation: {
    text: "Ладно... будь что будет.",
  },
};

export const TREES: DialogTrees = {
  level_server_room: {
    name: "Отключение",
    startId: "made_it_to_server_room_1",
  },
};
