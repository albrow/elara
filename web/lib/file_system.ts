import { fileSave, fileOpen, supported } from "browser-fs-access";

const loadOpts = {
  // List of allowed MIME types, defaults to `*/*`.
  mimeTypes: ["text/plain", "text/rhai"],
  // List of allowed file extensions (with leading '.'), defaults to `''`.
  extensions: [".rhai"],
  // Textual description for file dialog , defaults to `''`.
  description: "Rhai script",
  // By specifying an ID, the user agent can remember different directories for different IDs.
  id: "rhai-scripts",
  // Include an option to not apply any filter in the file picker, defaults to `false`.
  excludeAcceptAllOption: true,
};

const saveOpts = {
  // Suggested file name to use, defaults to `''`.
  fileName: "my_script.rhai",
  // Suggested file extensions (with leading '.'), defaults to `''`.
  extensions: [".rhai"],
  // By specifying an ID, the user agent can remember different directories for different IDs.
  id: "rhai-scripts",
  // Include an option to not apply any filter in the file picker, defaults to `false`.
  excludeAcceptAllOption: true,
};

export async function loadCode(): Promise<string> {
  const handle = await fileOpen(loadOpts);
  return handle.text();
}

export async function saveCode(script: string): Promise<void> {
  // If file picker API is not supported, use a basic prompt
  // to allow the user to specify a filename.
  if (!supported) {
    // eslint-disable-next-line no-alert
    const desiredName = prompt("Save as:", saveOpts.fileName);
    if (desiredName) {
      saveOpts.fileName = desiredName;
    } else {
      // Prompt was cancelled.
      return;
    }
  }

  // Create a blob from the script and save it.
  const blob = new Blob([script], { type: "text/plain" });
  fileSave(blob, saveOpts);
}
