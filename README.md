# Elara

Elara is a work-in-progress game which teaches you programming in a fun an interactive way :)

## Project structure

- **elara-lib/** is the root directory for the Rust crate. The Rust code is responsible
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

Running the dev server requires two separate commands (e.g. run in separate terminal windows).
In the first terminal window:

```sh
npm run watch:wasm
```

In the second:

```sh
npm run dev
```

This will start a development server on http://127.0.0.1:5173/. Auto-reloads
when any source code changes.

### How to build in release mode

Builds the project and places it into the **/web/dist** folder.

```sh
npm run build
```

Builds the project for distribution on Itch.io:

```sh
npm run build:itchio
```

Builds and packages the project as a native application via Electron:

```sh
npm run build:electron
```

### Run unit tests

```sh
npm test
```
