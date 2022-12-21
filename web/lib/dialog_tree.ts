export type DialogNode = {
  text: string;
  // eslint-disable-next-line no-use-before-define
  choices: DialogChoice[];
};

export type DialogChoice = {
  text: string;
  next?: DialogNode;
};

export type DialogTree = {
  name: string;
  start: DialogNode;
};

const dejaVu: DialogChoice = {
  text: "Let's do it again?",
};

const introStart: DialogNode = {
  text: "Welcome to Elara! My name is Marz. How was your journey here?",
  choices: [
    {
      text: "No complaints.",
      next: { text: "Glad to hear it!", choices: [dejaVu] },
    },
    {
      text: "Still feeling a little space-lagged.",
      next: {
        text: "Yeah.. I know the feeling. Luckily it's something you get used to!",
        choices: [dejaVu],
      },
    },
  ],
};

dejaVu.next = introStart;

const intro: DialogTree = {
  name: "Intro",
  start: introStart,
};

export interface DialogTrees {
  [key: string]: DialogTree;
}

export const DIALOG_TREES: DialogTrees = {
  intro,
};
