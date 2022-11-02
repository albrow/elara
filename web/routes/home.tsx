export default function Home() {
  return (
    <>
      <div className="lg:container lg:mx-auto my-4 px-8">
        <h1 className="text-3xl font-bold">Welcome to Elara</h1>
        <div className="my-4">
          <p className="my-2">
            Elara is a game that teaches you how to program using a language
            called{" "}
            <a
              className="text-blue-700 hover:text-blue-800 hover:underline font-bold"
              href="https://rhai.rs/book/ref/index.html"
            >
              Rhai
            </a>
            .
          </p>
          <p className="my-2">
            This is a{" "}
            <b>
              <em>very early</em>
            </b>{" "}
            build of the game! Things like artwork, music and sound effects, and
            many gameplay features are not ready yet. That said, there are a few
            levels that show off some basic gameplay mechanics. Select a level
            above to get started.
          </p>
          <p className="my-2">Feedback is greatly appreciated 😀</p>
        </div>
      </div>
    </>
  );
}
