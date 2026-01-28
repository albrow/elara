use std::collections::HashSet;

use super::{Level, LevelStyle, Outcome};
use crate::{
    constants::ERR_OUT_OF_ENERGY,
    simulation::{
        Actor, Button, ButtonConnection, DataPoint, EnergyCell, Obstacle, ObstacleKind,
        Orientation, Player, State,
    },
};

lazy_static! {
    static ref MESSAGES: Vec<&'static str> = vec![
        r"{markdown}
\== _Логи чата 2063.09.29_ \==

**Ада**: Привет, я слышала, ты работаешь над детектором бесконечных циклов?

**Алан**: Да! Теперь мы можем обнаружить бесконечный цикл и сообщить об ошибке ещё до запуска кода. Это должно помочь предотвратить зависание компьютеров наших инженеров. Пока я протестировал это с циклами loop и while.

**Ада**: Круто. Некоторые инженеры также могут использовать рекурсию для повторения кода. Ты это тестировал?

**Алан**: О, я почти забыл. Дай-ка погуглю, как работает рекурсия...
",
        r#"{markdown}
\== _Логи чата 2063.10.01_ \==

**Георгий**: Я наблюдал за роверами в «режиме автоматической уборки» и заметил кое-что. Похоже, в этом режиме они не могут двигаться назад. Это сделано специально?

**Мария**: Подожди...

**Мария**: Я только что посмотрела код и, кажется, ты прав. Вместо движения назад они просто дважды поворачиваются, что занимает больше времени. Запишу это, но не уверена, что у нас будет время это исправить.

**Георгий**: Понял. Пока роверы справляются с уборкой, не страшно, если это занимает немного больше времени. Можно отложить это на потом.
"#,
        r"{markdown}
\== _Логи чата 2063.10.02_ \==

**Мария**: Есть тут эксперты по CSS, чтобы помочь? Я просто хочу сделать всплывающую подсказку над кнопкой, но чтобы она не выходила за край экрана. Хочу, чтобы она перемещалась и всегда была видна.

**Алан**: Думаю, @Ада больше всех практикуется в этой тёмной магии.

**Ада**: Лол, честно говоря, я обычно просто пробую разное, пока не заработает. Но рада помочь!
",
        r#"{markdown}
\== _Логи чата 2063.10.05_ \==

**Алан**: Я слышал, кто-то предложил функцию `wait`, которая заставит роверы просто ждать. Что думаете?

**Мари**: Хм... надо стараться минимизировать количество встроенных функций. Разве нельзя сделать то же самое через `say("waiting")`?

**Алан**: Да, наверное, ты права! Посоветую им так делать.
"#,
        r"{markdown}

\== _Логи чата 2063.10.09_ \==

**Мари**: В информатике есть две сложные задачи...

**Мари**: ...инвалидация кэша, именование переменных и ошибки на единицу.

**Алан**: О нет, опять начинается. Может, сделаем отдельный канал для шуток?

**Мария**: rofl.gif [изображение не найдено]

**Алан**: Мне кажется, сложных задач в информатике больше двух.
",
        r"{markdown}

\== _Логи чата 2063.10.12_ \==

**Георгий**: Зачем нам вообще нужна кнопка аварийного отключения? Роверы ведь не опасны? Ну, кроме G.R.E.T.A., они даже не такие большие.

**Мария**: Это просто мера предосторожности. Мы не ожидаем проблем, но лучше перестраховаться.

**Георгий**: Логично. Просто боюсь, что кто-то случайно её нажмёт. Может, поставить её где-нибудь менее заметно?

**Ада**: Это противоречит её назначению. Она должна быть там, где её легко найти в экстренной ситуации.
",
    ];
}

#[derive(Copy, Clone)]
pub struct ServerRoom {}

impl Level for ServerRoom {
    fn name(&self) -> &'static str {
        "Отключение"
    }
    fn short_name(&self) -> &'static str {
        "server_room"
    }
    fn style(&self) -> LevelStyle {
        LevelStyle::GlossyTiles
    }
    fn camera_text(&self) -> &'static str {
        "Лунная база Альфа: Внутренняя камера A"
    }
    fn objective(&self) -> &'static str {
        "Нажмите кнопку ({button}), чтобы отключить серверы."
    }
    fn initial_code(&self) -> &'static str {
        r#"// Осталось сделать только одно...
"#
    }
    fn initial_states(&self) -> Vec<State> {
        let mut state = State::new();
        state.player = Player::new(6, 7, 12, Orientation::Up);
        state.buttons = vec![Button::new_with_info(
            6,
            0,
            ButtonConnection::None,
            "Нажатие этой кнопки отключит серверы и деактивирует *ВСЕ* роверы на Эларе."
                .into(),
        )];
        state.energy_cells = vec![EnergyCell::new(2, 7), EnergyCell::new(6, 4)];
        state.data_points = vec![
            DataPoint::new_with_info(
                0,
                7,
                MESSAGES[0].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
            DataPoint::new_with_info(
                1,
                5,
                MESSAGES[1].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
            DataPoint::new_with_info(
                4,
                5,
                MESSAGES[2].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
            DataPoint::new_with_info(
                8,
                3,
                MESSAGES[3].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
            DataPoint::new_with_info(
                10,
                3,
                MESSAGES[4].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
            DataPoint::new_with_info(
                3,
                1,
                MESSAGES[5].into(),
                "Эта точка данных содержит сообщение от команды, построившей Лунную базу Альфа."
                    .into(),
            ),
        ];
        state.obstacles = vec![
            Obstacle::new_with_kind(0, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 1, ObstacleKind::Server),
            // Obstacle::new_with_kind(3, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(4, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(8, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(10, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 1, ObstacleKind::Server),
            Obstacle::new_with_kind(0, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(1, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(4, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 3, ObstacleKind::Server),
            // Obstacle::new_with_kind(8, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 3, ObstacleKind::Server),
            // Obstacle::new_with_kind(10, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 3, ObstacleKind::Server),
            Obstacle::new_with_kind(0, 5, ObstacleKind::Server),
            // Obstacle::new_with_kind(1, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(2, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(3, 5, ObstacleKind::Server),
            // Obstacle::new_with_kind(4, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(5, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(7, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(8, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(9, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(10, 5, ObstacleKind::Server),
            Obstacle::new_with_kind(11, 5, ObstacleKind::Server),
        ];
        vec![state]
    }
    fn actors(&self) -> Vec<Box<dyn Actor>> {
        vec![]
    }
    fn check_win(&self, state: &State) -> Outcome {
        // Note that this level uses a different check_win function. There is not
        // goal to reach. Instead you beat the level by pressing the button.
        if state.player.energy == 0 {
            Outcome::Failure(ERR_OUT_OF_ENERGY.to_string())
        } else if state.buttons[0].currently_pressed {
            Outcome::Success
        } else {
            Outcome::Continue
        }
    }
    fn challenge(&self) -> Option<&'static str> {
        Some("Используйте функцию `say`, чтобы прочитать сообщения на всех точках данных.")
    }
    fn check_challenge(
        &self,
        states: &[State],
        _script: &str,
        _stats: &crate::script_runner::ScriptStats,
    ) -> bool {
        let mut remaining_messages: HashSet<String> =
            MESSAGES.iter().map(|s| s.to_string()).collect();
        for state in states {
            if remaining_messages.contains(&state.player.message) {
                remaining_messages.remove(&state.player.message);
            }
        }
        remaining_messages.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::levels::Outcome;

    #[test]
    fn level() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ServerRoom {};

        // Running the initial code should result in Outcome::Continue.
        let script = LEVEL.initial_code();
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Continue);

        // Running this code should result in Outcome::Success.
        let script = r"
            move_forward(6);
            press_button();
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
    }

    #[test]
    fn challenge() {
        let mut game = crate::Game::new();
        const LEVEL: &'static dyn Level = &ServerRoom {};

        // This code beats the objective but does not complete the challenge.
        let script = r"
            move_forward(6);
            press_button();
        ";
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);

        // Running this code should pass the challenge.
        let script = r#"
            turn_left();
            move_forward(5);
            say(read_data());
            turn_right();
            move_forward(1);
            say(read_data());
            turn_right();
            move_forward(3);
            say(read_data());
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            say(read_data());
            move_forward(2);
            say(read_data());
            move_backward(4);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(3);
            say(read_data());
            move_backward(3);
            turn_right();
            move_forward(1);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(result.passes_challenge);

        // This code should not pass the challenge because it skips the
        // last data point.
        let script = r#"
            turn_left();
            move_forward(5);
            say(read_data());
            turn_right();
            move_forward(1);
            say(read_data());
            turn_right();
            move_forward(3);
            say(read_data());
            move_forward(2);
            turn_left();
            move_forward(2);
            turn_right();
            move_forward(2);
            say(read_data());
            move_forward(2);
            say(read_data());
            move_backward(4);
            turn_left();
            move_forward(2);
            turn_left();
            move_forward(3);
            // say(read_data());
            move_backward(3);
            turn_right();
            move_forward(1);
            press_button();
        "#;
        let result = game
            .run_player_script_with_all_funcs_unlocked(LEVEL, script.to_string())
            .unwrap();
        assert_eq!(result.outcome, Outcome::Success);
        assert!(!result.passes_challenge);
    }
}
