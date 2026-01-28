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
    title: "Как запустить код",
    text: `Нажмите "Запуск", а затем "Воспроизведение", чтобы запустить ваш код. Код заставит ровер двигаться и выполнять действия.`,
    imageUrl: howToRunCodeUrl,
  },
  how_to_pause_and_step: {
    title: "Шаг за шагом",
    text: "Вы можете использовать кнопки или перетаскивать ползунок, чтобы перемещаться вперёд или назад по коду. Это полезно для замедления или пропуска вперёд.",
    imageUrl: howToPauseAndStepUrl,
  },
  how_to_see_errors: {
    title: "Сообщения об ошибках",
    text: "Даже лучшие программисты иногда допускают ошибки! Если навести курсор на красную точку, можно увидеть больше информации об ошибке.",
    imageUrl: howToSeeErrorsUrl,
  },
  where_to_find_objectives: {
    title: "Задания",
    text: "Текущее задание отображается в верхней части экрана. Обычно нужно переместить ровер к цели, но иногда может потребоваться сделать что-то другое.",
    imageUrl: whereToFindObjectivesUrl,
  },
  back_to_hub: {
    title: "Возврат в центр управления",
    text: 'Вы можете вернуться в центр управления в любое время, нажав кнопку "Центр". Оттуда можно вернуться к предыдущим уровням или посмотреть журнал.',
    imageUrl: backToHubUrl,
  },
  moving_takes_energy: {
    title: "Энергия",
    text: "Маленькое число рядом с Г.Р.О.В.Е.Р.ом показывает текущий запас энергии. Перемещение тратит одну единицу энергии на клетку.",
    imageUrl: movingTakesEnergyUrl,
  },
  how_to_get_more_energy: {
    title: "Как получить больше энергии",
    text: "Если энергия закончится, вы не сможете выполнить задание. Получить больше энергии можно, собрав энергоячейку.",
    imageUrl: howToGetMoreEnergyUrl,
  },
  how_to_view_function_list: {
    title: "Список доступных функций",
    text: `Вы можете посмотреть список доступных функций для любого уровня, нажав кнопку "Список функций".`,
    imageUrl: howToViewFunctionListUrl,
  },
  extra_challenges: {
    title: "Дополнительные задания",
    text: "Некоторые уровни имеют дополнительные задания, но не переживайте, если не получится выполнить их сразу. Вы всегда можете вернуться и попробовать позже!",
    imageUrl: extraChallengesUrl,
  },
  show_hints_and_dialog: {
    title: "Подсказки и диалоги",
    text: 'Если вы застряли, нажмите кнопку "Показать подсказки" в верхней части экрана. Если на уровне есть диалог, можно нажать "Показать диалог", чтобы посмотреть его снова.',
    imageUrl: showHintsAndDialogUrl,
  },
  hover_over_text: {
    title: "Наведите на функции",
    text: "Если навести курсор на функцию, выделенную фиолетовым цветом, можно узнать больше о том, как она работает, и посмотреть примеры.",
    imageUrl: hoverOverTextUrl,
  },
  hover_over_board: {
    title: "Наведите на поле",
    text: "Вы также можете навести курсор на поле, чтобы узнать больше о различных объектах, с которыми Г.Р.О.В.Е.Р. может взаимодействовать.",
    imageUrl: hoverOverBoardUrl,
  },
};

export type ShortId = keyof typeof SHORTS;
