export default function Home() {
  return (
    <>
      <div className="lg:container lg:mx-auto my-4 px-8">
        <h1 className="text-3xl font-bold">Welcome to Elara</h1>
        <div className="my-4">
          <p className="my-2 mt-10">
            Elara is a game that teaches you how to program. It is named after
            one of the{" "}
            <a
              className="text-blue-700 hover:text-blue-800 hover:underline font-bold"
              href="https://en.wikipedia.org/wiki/Elara_(moon)"
            >
              moons of Jupiter
            </a>
            , where the bulk of the game will take place.
          </p>
          <p className="my-2">
            This is a{" "}
            <b>
              <em>very early</em>
            </b>{" "}
            build of the game! Things like story, artwork, music and sound
            effects, and many gameplay features are not ready yet. There will be
            significant changes before the final version of the game is ready to
            release, and your feedback can help us get there 😀
          </p>
          <p className="my-2">
            Right now, we are focusing on testing the core mechanics of the
            game, which includes writing code to control a drone and solve
            various puzzles. For now, you will need to switch between levels
            manually. Select a level above to get started!
          </p>
          <p className="my-2 mt-10">
            Elara uses a full-featured scripting language called{" "}
            <a
              className="text-blue-700 hover:text-blue-800 hover:underline font-bold"
              href="https://rhai.rs/book/ref/index.html"
            >
              Rhai
            </a>
            , chosen because it is easy to learn, runs efficiently, supports
            WebAssembly, and offers important safegaurds such as limiting the
            kind of code a user can write and preventing infinite loops. Almost
            all of the features of the Rhai language are supported so feel free
            to read the Rhai docs and play around a bit. The current levels are
            fairly simple, but future updates will include more complex levels
            designed to teach you about variables, control flow, user-defined
            functions, and other common programming language features.
          </p>
        </div>
      </div>
    </>
  );
}
