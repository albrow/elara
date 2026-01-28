import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "intro"
  | "intro_2"
  | "ask_about_journey"
  | "journey_neg_response"
  | "journey_pos_response"
  | "who_i_am"
  | "where_i_am"
  | "where_you_are"
  | "offer_intro_end"
  | "offer_intro_end_b"
  | "offer_intro_end_c";
export type ChoiceIds =
  | "greet_kalina"
  | "journey_negative"
  | "journey_positive"
  | "where_are_you"
  | "who_are_you"
  | "where_am_i"
  | "intro_end";

export const NODES: { [key in NodeIds]: DialogNode } = {
  intro: {
    text: "Привет! Ты, должно быть, новый стажёр.",
    choiceIds: [],
    nextId: "intro_2",
  },
  intro_2: {
    text: "Добро пожаловать на Элару! Меня зовут Калина.",
    choiceIds: ["greet_kalina"],
  },
  ask_about_journey: {
    text: "Как прошло твоё путешествие сюда?",
    choiceIds: ["journey_negative", "journey_positive"],
  },
  journey_neg_response: {
    text: "Да уж.. Понимаю это чувство. К счастью, к этому привыкаешь.",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you"],
  },
  journey_pos_response: {
    text: "Ого, тебе повезло! После первого полёта я страдала от космического джетлага несколько дней.",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you"],
  },
  where_i_am: {
    text:
      "Я звоню с Лунной базы Бета в южном полушарии Элары. " +
      "База небольшая, но я рада называть её домом. И вид здесь потрясающий!",
    choiceIds: [],
    nextId: "offer_intro_end",
  },
  who_i_am: {
    text:
      "Ну, моё имя ты уже знаешь. Я инженер в Ganymede Robotics. " +
      "Ещё я отвечаю за обучение новых стажёров, включая тебя!",
    choiceIds: [],
    nextId: "offer_intro_end_b",
  },
  where_you_are: {
    text:
      "Космический джетлаг сильно ударил, да? Не переживай! Скоро всё вспомнишь. " +
      "Если посмотришь в окно, увидишь луну странной формы. Это Элара! " +
      "Сейчас ты находишься на орбите вокруг неё в небольшом модуле.",
    choiceIds: [],
    nextId: "offer_intro_end_c",
  },
  offer_intro_end: {
    text: "Так что.. готов начать обучение или есть ещё вопросы?",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you", "intro_end"],
  },
  offer_intro_end_b: {
    text: "Хочешь ещё что-нибудь узнать, прежде чем мы начнём?",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you", "intro_end"],
  },
  offer_intro_end_c: {
    text: "В любом случае, я готова начать, когда ты будешь готов. Ну что?",
    choiceIds: ["who_are_you", "where_am_i", "where_are_you", "intro_end"],
  },
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  greet_kalina: {
    text: "Приятно познакомиться!",
    nextId: "ask_about_journey",
  },
  journey_negative: {
    text: "Ещё немного страдаю от космического джетлага.",
    nextId: "journey_neg_response",
  },
  journey_positive: {
    text: "Всё хорошо.",
    nextId: "journey_pos_response",
  },
  where_are_you: {
    text: "Откуда ты звонишь?",
    nextId: "where_i_am",
  },
  who_are_you: {
    text: "Кто ты такая?",
    nextId: "who_i_am",
  },
  where_am_i: {
    text: "Где я?",
    nextId: "where_you_are",
  },
  intro_end: {
    text: "Поехали!",
  },
};

export const TREES: DialogTrees = {
  intro: {
    name: "Вступление",
    startId: "intro",
  },
};
