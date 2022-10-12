## Project structure

- **battle-game-lib/** is the root directory for the Rust crate. The Rust code is responsible
  for most game logic, but doesn't do any rendering.

- **web/** is the root directory for the web UI. This is the part of the code responsible for
  rendering and user interaction.

## Prerequisites

- Rust and Cargo version >= 1.62.1
- Node version >= 16.17.0
- `cargo-watch` ([install here](https://lib.rs/crates/cargo-watch))
- `wasm-pack` ([install here](https://rustwasm.github.io/wasm-pack/installer/))

## Common commands

### Install dependencies

```sh
npm install
npm run build:wasm
```

### Run dev server

Builds the project and starts a development server on http://127.0.0.1:5173/. Auto-reloads
when any source code changes.

```sh
npm run dev
```

### How to build in release mode

Builds the project and places it into the **/web/dist** folder.

```sh
npm run build
```

### Run unit tests

```sh
npm test
```
