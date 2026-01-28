import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "right_turns_ahead"
  | "right_turns_ahead_2"
  | "idea_to_turn_right"
  | "not_might_makes_a_right"
  | "not_two_negatives"
  | "how_to_use_three_lefts"
  | "three_lefts_will_take_longer";
export type ChoiceIds =
  | "how_to_turn_right"
  | "guess_might_makes_a_right"
  | "guess_three_lefts_make_a_right"
  | "guess_two_negatives"
  | "ack_idea_to_turn_right"
  | "wont_three_lefts_take_longer";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  right_turns_ahead: {
    text:
      "У нас тут небольшая проблема... Похоже, впереди много правых поворотов, " +
      "но сейчас Г.Р.О.В.Е.Р. может поворачивать только налево.",
    choiceIds: [],
    nextId: "right_turns_ahead_2",
  },
  right_turns_ahead_2: {
    text: "Было бы *очень* удобно, если бы Г.Р.О.В.Е.Р. мог как-то поворачивать направо.",
    choiceIds: ["how_to_turn_right"],
  },
  idea_to_turn_right: {
    text:
      `О, у меня есть идея! Знаешь поговорку «два левых не делают правого»? Ну... ` +
      `а что делает?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  not_might_makes_a_right: {
    text: `Я слышала поговорку «сила есть — ума не надо», но я имела в виду другое. Попробуешь ещё раз?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  not_two_negatives: {
    text:
      `Конечно, если умножить два отрицательных числа, получится положительное, ` +
      `но я думала о другом. Попробуешь ещё раз?`,
    choiceIds: [
      "guess_might_makes_a_right",
      "guess_three_lefts_make_a_right",
      "guess_two_negatives",
    ],
  },
  how_to_use_three_lefts: {
    text:
      "Именно! Почему бы тебе не попробовать создать новую функцию, которая просто поворачивает Г.Р.О.В.Е.Р.а " +
      "три раза налево?",
    choiceIds: ["wont_three_lefts_take_longer", "ack_idea_to_turn_right"],
  },
  three_lefts_will_take_longer: {
    text:
      "Да, Г.Р.О.В.Е.Р.у понадобится в три раза больше времени, чтобы повернуть таким способом. Но " +
      "зато ты можешь написать меньше строк кода! К тому же это временно, пока мы не отремонтируем его.",
    choiceIds: ["ack_idea_to_turn_right"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  how_to_turn_right: {
    text: "Есть идеи?",
    nextId: "idea_to_turn_right",
  },
  guess_might_makes_a_right: {
    text: "Сила?",
    nextId: "not_might_makes_a_right",
  },
  guess_three_lefts_make_a_right: {
    text: "Три левых?",
    nextId: "how_to_use_three_lefts",
  },
  guess_two_negatives: {
    text: "Два отрицательных?",
    nextId: "not_two_negatives",
  },
  ack_idea_to_turn_right: {
    text: "Я попробую!",
  },
  wont_three_lefts_take_longer: {
    text: "Разве это не займёт больше времени?",
    nextId: "three_lefts_will_take_longer",
  },
};

export const TREES: DialogTrees = {
  level_reimplement_turn_right: {
    name: "Переделать функцию turn_right",
    startId: "right_turns_ahead",
  },
};
