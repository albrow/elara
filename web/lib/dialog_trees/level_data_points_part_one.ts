import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "lost_recipe_ask_for_help"
  | "explain_lost_recipe_1"
  | "explain_lost_recipe_2"
  | "explain_hummus_ingredients_1"
  | "explain_hummus_ingredients_2"
  | "reiterate_lost_recipe"
  | "explain_data_point_1"
  | "explain_data_point_2"
  | "remind_use_say_to_get_recipe";
export type ChoiceIds =
  | "lost_recipe_what_is_it"
  | "what_is_a_data_point"
  | "how_make_hummus_on_moon"
  | "ack_supply_pod"
  | "ack_data_points"
  | "ack_use_say_to_get_recipe";

export const NODES: {
  [key in NodeIds]: DialogNode;
} = {
  lost_recipe_ask_for_help: {
    text: `Раз мы здесь, не мог бы ты помочь мне кое с чем?`,
    choiceIds: ["lost_recipe_what_is_it"],
  },
  explain_lost_recipe_1: {
    text:
      "Значит так... у меня был потрясающий рецепт хумуса, сохранённый на моём ноутбуке, но недавно " +
      "мне пришлось заменить ноутбук, и теперь рецепт потерян!",
    choiceIds: [],
    nextId: "explain_lost_recipe_2",
  },
  explain_lost_recipe_2: {
    text: "Хорошая новость в том, что у меня есть резервная копия рецепта на ближайшей точке данных.",
    choiceIds: ["how_make_hummus_on_moon", "what_is_a_data_point"],
  },
  explain_hummus_ingredients_1: {
    text:
      "Отличный вопрос! На орбите Ганимеда есть большая тепличная станция. Там нельзя " +
      "вырастить всё, что можно вырастить на Земле, но мы обходимся тем, что есть.",
    choiceIds: [],
    nextId: "explain_hummus_ingredients_2",
  },
  explain_hummus_ingredients_2: {
    text: "Время от времени оттуда присылают грузовую капсулу со свежими ингредиентами.",
    choiceIds: ["ack_supply_pod"],
  },
  reiterate_lost_recipe: {
    text: "В общем, поможешь мне достать рецепт из точки данных?",
    choiceIds: ["what_is_a_data_point"],
  },
  explain_data_point_1: {
    text:
      "Точки данных разбросаны по всей Эларе и могут хранить разную информацию. " +
      "Иногда они содержат важные данные (например, рецепты хумуса!). А иногда они подключены " +
      "к сенсорам, которые предоставляют полезную информацию об окружающей среде.",
    choiceIds: [],
    nextId: "explain_data_point_2",
  },
  explain_data_point_2: {
    text:
      "Ты можешь взаимодействовать с точками данных, подведя Г.Р.О.В.Е.Р.а к ним и вызвав " +
      "функцию `read_data`.",
    choiceIds: ["ack_data_points"],
  },
  remind_use_say_to_get_recipe: {
    text:
      "Так что всё, что тебе нужно сделать — это заставить Г.Р.О.В.Е.Р.а прочитать рецепт хумуса из точки данных и " +
      "произнести его с помощью функции `say`.",
    choiceIds: ["ack_use_say_to_get_recipe"],
  },
};

export const CHOICES: {
  [key in ChoiceIds]: DialogChoice;
} = {
  lost_recipe_what_is_it: {
    text: "С чем именно?",
    nextId: "explain_lost_recipe_1",
  },
  what_is_a_data_point: {
    text: "Что такое точка данных?",
    nextId: "explain_data_point_1",
  },
  how_make_hummus_on_moon: {
    text: "Подожди секунду... откуда у тебя ингредиенты для хумуса так далеко от Земли?",
    nextId: "explain_hummus_ingredients_1",
  },
  ack_supply_pod: {
    text: "Ого, круто!",
    nextId: "reiterate_lost_recipe",
  },
  ack_data_points: {
    text: "Понятно.",
    nextId: "remind_use_say_to_get_recipe",
  },
  ack_use_say_to_get_recipe: {
    text: "Без проблем!",
  },
};

export const TREES: DialogTrees = {
  level_data_points_part_one: {
    name: "Точки данных",
    startId: "lost_recipe_ask_for_help",
  },
};
