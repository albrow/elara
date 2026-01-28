import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "do_you_see_evil_rover"
  | "point_out_evil_rover_sighting"
  | "ack_evil_rover_sighting"
  | "evil_rover_cant_get_you"
  | "explain_why_grover_isnt_affected"
  | "carry_on_while_i_check_evil_rover";
export type ChoiceIds =
  | "evil_rover_see_what"
  | "evil_rover_confirm_sighting"
  | "ask_why_grover_isnt_affected"
  | "ack_carry_on_while_i_check_evil_rover";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  do_you_see_evil_rover: {
    text: "Ой-ой... ты это видишь?",
    choiceIds: ["evil_rover_see_what", "evil_rover_confirm_sighting"],
  },
  point_out_evil_rover_sighting: {
    text: "Вон там! Похоже, ещё один неисправный ровер. Кажется, проблема распространяется.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  ack_evil_rover_sighting: {
    text: "Хорошо, что я не одна это вижу. Похоже, всё больше и больше роверов поражается этими неисправностями.",
    choiceIds: [],
    nextId: "evil_rover_cant_get_you",
  },
  evil_rover_cant_get_you: {
    text: "Хорошая новость в том, что этот, похоже, пока не может добраться до Г.Р.О.В.Е.Р.а. На пути есть камни.",
    choiceIds: ["ask_why_grover_isnt_affected"],
  },
  explain_why_grover_isnt_affected: {
    text: "Я не уверена. Поскольку Г.Р.О.В.Е.Р. специально разработан для обучения, он работает на другой операционной системе, чем остальные роверы. Возможно, это означает, что он не подвержен тем же неисправностям.",
    choiceIds: [],
    nextId: "carry_on_while_i_check_evil_rover",
  },
  carry_on_while_i_check_evil_rover: {
    text: "Я сосредоточусь на расследовании проблемы. А ты просто продолжай делать то, что делаешь. У тебя пока отлично получается!",
    choiceIds: ["ack_carry_on_while_i_check_evil_rover"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  evil_rover_see_what: {
    text: "Вижу что?",
    nextId: "point_out_evil_rover_sighting",
  },
  evil_rover_confirm_sighting: {
    text: "Да, я тоже это вижу.",
    nextId: "ack_evil_rover_sighting",
  },
  ask_why_grover_isnt_affected: {
    text: "Г.Р.О.В.Е.Р. тоже начнёт глючить?",
    nextId: "explain_why_grover_isnt_affected",
  },
  ack_carry_on_while_i_check_evil_rover: {
    text: "Спасибо! Так и сделаю.",
  },
};

export const TREES: DialogTrees = {
  level_gate_and_data_point_part_two: {
    name: "Вылетело из головы",
    startId: "do_you_see_evil_rover",
  },
};
