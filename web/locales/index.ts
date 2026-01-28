/**
 * Locales index - exports all available translations
 * To add a new language:
 * 1. Create a new JSON file (e.g., fr.json) following the same structure as en.json
 * 2. Import and export it here
 * 3. Add it to the AVAILABLE_LOCALES array
 */

import en from "./en.json";
import ru from "./ru.json";

export type LocaleCode = "en" | "ru";

export interface LocaleMeta {
  name: string;
  nativeName: string;
  code: LocaleCode;
}

export interface LocaleData {
  meta: LocaleMeta;
  common: Record<string, string>;
  title: Record<string, string>;
  settings: Record<string, string>;
  editor: Record<string, string>;
  level: Record<string, string>;
  success: Record<string, string>;
  journal: Record<string, string>;
  dialog: Record<string, string>;
  hub: Record<string, string>;
  tutorial: Record<string, string>;
  errors: Record<string, string>;
  hints: Record<string, string>;
}

export const locales: Record<LocaleCode, LocaleData> = {
  en: en as LocaleData,
  ru: ru as LocaleData,
};

export const AVAILABLE_LOCALES: LocaleMeta[] = [
  { name: "English", nativeName: "English", code: "en" },
  { name: "Russian", nativeName: "Русский", code: "ru" },
];

export const DEFAULT_LOCALE: LocaleCode = "en";

export { en, ru };
