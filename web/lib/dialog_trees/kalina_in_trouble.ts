import { DialogChoice, DialogNode, DialogTrees } from ".";

export type NodeIds =
  | "kalina_in_trouble"
  | "explain_moonbase_attack_1"
  | "explain_moonbase_attack_2"
  | "moonbase_damage_details"
  | "confirm_kalina_safe"
  | "explain_repair_problem_1"
  | "explain_repair_problem_2"
  | "explain_shutdown_plan_1"
  | "explain_shutdown_plan_2"
  | "clarify_all_rovers"
  | "cant_call_someone"
  | "cant_disable_remotely"
  | "joke_difficult_first_day"
  | "joke_difficult_first_day_2"
  | "kalina_can_help_from_afar";

export type ChoiceIds =
  | "ask_why_kalina_in_trouble"
  | "ask_about_moonbase_damage"
  | "ask_is_kalina_safe"
  | "ask_how_to_help_kalina"
  | "ask_what_to_do_about_moonbase"
  | "ask_clarify_all_rovers"
  | "ack_shutdown_plan"
  | "ask_alternate_call_someone"
  | "ask_alternate_remote_disable"
  | "ack_first_day_joke"
  | "ack_kalina_can_help_from_afar";

export const NODES: { [key in NodeIds]: DialogNode } = {
  kalina_in_trouble: {
    text: "Кажется... у меня серьёзные проблемы...",
    choiceIds: ["ask_why_kalina_in_trouble"],
  },
  explain_moonbase_attack_1: {
    text: "Неисправные роверы совсем вышли из-под контроля. Некоторые из них атаковали мою базу!",
    choiceIds: [],
    nextId: "explain_moonbase_attack_2",
  },
  explain_moonbase_attack_2: {
    text: "Я до сих пор на 100% не уверена, почему это происходит, но они повредили критическую инфраструктуру и оборудование.",
    choiceIds: ["ask_about_moonbase_damage", "ask_is_kalina_safe"],
  },
  moonbase_damage_details: {
    text: "Они повредили генератор энергии, системы жизнеобеспечения и искусственную гравитацию. База работает на аварийном резервном питании, но это ненадолго.",
    choiceIds: [
      "ask_about_moonbase_damage",
      "ask_is_kalina_safe",
      "ask_how_to_help_kalina",
    ],
  },
  confirm_kalina_safe: {
    text: "Пока я в безопасности. Неисправные роверы не смогут до меня добраться, но я не знаю, сколько смогу продержаться.",
    choiceIds: [
      "ask_about_moonbase_damage",
      "ask_is_kalina_safe",
      "ask_how_to_help_kalina",
    ],
  },
  explain_repair_problem_1: {
    text: "Ну... я должна суметь восстановить питание базы и запустить критические системы, но для этого мне нужен доступ к панели управления снаружи.",
    choiceIds: [],
    nextId: "explain_repair_problem_2",
  },
  explain_repair_problem_2: {
    text: "Пытаться делать ремонт, пока неисправные роверы всё ещё там — небезопасно!",
    choiceIds: ["ask_what_to_do_about_moonbase"],
  },
  explain_shutdown_plan_1: {
    text: "Я кое-что придумала... но это будет непросто.",
    choiceIds: [],
    nextId: "explain_shutdown_plan_2",
  },
  explain_shutdown_plan_2: {
    text: "В серверной комнате на Лунной базе Альфа есть кнопка аварийного отключения. Если ты сможешь привести туда Г.Р.О.В.Е.Р.а и заставить его нажать кнопку, это отключит всех роверов на Эларе.",
    choiceIds: ["ask_clarify_all_rovers"],
  },
  clarify_all_rovers: {
    text: "Да, всех. К сожалению, это значит и Г.Р.О.В.Е.Р.а тоже. Я пыталась придумать альтернативу, но другого выхода нет. По крайней мере, за то время, что у нас есть.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  cant_call_someone: {
    text: "Здесь на Эларе больше никого нет с тех пор, как несколько лет назад автоматизировали большинство операций. Космос огромен, а луны Юпитера довольно далеко друг от друга. Отправка кого-то сюда займёт дни или даже недели.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  cant_disable_remotely: {
    text: "Поверь, я пыталась. С тех пор как роверы начали неисправно работать, они не отвечают на мои команды.",
    choiceIds: [
      "ask_alternate_call_someone",
      "ask_alternate_remote_disable",
      "ack_shutdown_plan",
    ],
  },
  joke_difficult_first_day: {
    text: "Я знаю, что прошу о многом...",
    choiceIds: [],
    nextId: "joke_difficult_first_day_2",
  },
  joke_difficult_first_day_2: {
    text: "Не совсем то, что ты ожидал, когда записывался на стажировку, да?",
    choiceIds: ["ack_first_day_joke"],
  },
  kalina_can_help_from_afar: {
    text: "Я буду следить за твоим прогрессом и помогать чем смогу отсюда. У тебя получится! Я рассчитываю на тебя!",
    choiceIds: ["ack_kalina_can_help_from_afar"],
  },
};

export const CHOICES: { [key in ChoiceIds]: DialogChoice } = {
  ask_why_kalina_in_trouble: {
    text: "Что случилось?",
    nextId: "explain_moonbase_attack_1",
  },
  ask_about_moonbase_damage: {
    text: "Какие повреждения?",
    nextId: "moonbase_damage_details",
  },
  ask_is_kalina_safe: {
    text: "Ты в безопасности?",
    nextId: "confirm_kalina_safe",
  },
  ask_how_to_help_kalina: {
    text: "Чем я могу помочь?",
    nextId: "explain_repair_problem_1",
  },
  ask_what_to_do_about_moonbase: {
    text: "Понятно. Что мы можем сделать?",
    nextId: "explain_shutdown_plan_1",
  },
  ask_clarify_all_rovers: {
    text: "Подожди... ты имеешь в виду ВСЕХ роверов?",
    nextId: "clarify_all_rovers",
  },
  ask_alternate_call_someone: {
    text: "Разве нельзя позвать кого-то ещё из Ganymede Robotics?",
    nextId: "cant_call_someone",
  },
  ask_alternate_remote_disable: {
    text: "Нет способа отключить роверов удалённо?",
    nextId: "cant_disable_remotely",
  },
  ack_shutdown_plan: {
    text: "Ладно, я сделаю это.",
    nextId: "joke_difficult_first_day",
  },
  ack_first_day_joke: {
    text: "Да уж...",
    nextId: "kalina_can_help_from_afar",
  },
  ack_kalina_can_help_from_afar: {
    text: "Нельзя терять время!",
  },
};

export const TREES: DialogTrees = {
  kalina_in_trouble: {
    name: "Калина в беде",
    startId: "kalina_in_trouble",
  },
};
