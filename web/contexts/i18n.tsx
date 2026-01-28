/**
 * i18n Context - Provides internationalization support for the application
 * 
 * Usage:
 * 1. Wrap your app with <I18nProvider>
 * 2. Use the useTranslation hook to get translations: const { t } = useTranslation();
 * 3. Use t("namespace.key") to get translated strings
 * 4. Use t("namespace.key", { param: "value" }) for interpolation
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  locales,
  LocaleCode,
  LocaleData,
  AVAILABLE_LOCALES,
  DEFAULT_LOCALE,
  LocaleMeta,
} from "../locales";

const STORAGE_KEY = "elara_language";

interface I18nContextValue {
  /** Current locale code */
  locale: LocaleCode;
  /** Change the current locale */
  setLocale: (locale: LocaleCode) => void;
  /** Get a translated string by key path (e.g., "common.continue") */
  t: (key: string, params?: Record<string, string | number>) => string;
  /** List of available locales */
  availableLocales: LocaleMeta[];
  /** Current locale data */
  localeData: LocaleData;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Detects the user's preferred language from browser settings
 */
function detectBrowserLanguage(): LocaleCode {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (!browserLang) {
    return DEFAULT_LOCALE;
  }

  // Extract language code (e.g., "en-US" -> "en")
  const langCode = browserLang.split("-")[0].toLowerCase();

  // Check if we support this language
  if (langCode in locales) {
    return langCode as LocaleCode;
  }

  return DEFAULT_LOCALE;
}

/**
 * Gets the stored language preference or detects from browser
 */
function getInitialLocale(): LocaleCode {
  // Try to get from localStorage
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in locales) {
      return stored as LocaleCode;
    }
  }

  // Fall back to browser detection
  return detectBrowserLanguage();
}

interface I18nProviderProps {
  children: React.ReactNode;
  /** Override initial locale (useful for testing) */
  initialLocale?: LocaleCode;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<LocaleCode>(
    initialLocale ?? getInitialLocale()
  );

  const localeData = useMemo(() => locales[locale], [locale]);

  const setLocale = useCallback((newLocale: LocaleCode) => {
    if (newLocale in locales) {
      setLocaleState(newLocale);
      // Persist to localStorage
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newLocale);
      }
    } else {
      console.warn(`Locale "${newLocale}" is not available`);
    }
  }, []);

  // Persist initial detected locale
  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, locale);
      }
    }
  }, [locale]);

  /**
   * Translation function with interpolation support
   * @param key - Dot-separated key path (e.g., "common.continue" or "errors.functionNotUnlocked")
   * @param params - Optional parameters for interpolation (e.g., { funcName: "move_forward" })
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const parts = key.split(".");
      
      // Navigate to the value
      let value: any = localeData;
      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = value[part];
        } else {
          // Key not found, try fallback to English
          let fallback: any = locales[DEFAULT_LOCALE];
          for (const p of parts) {
            if (fallback && typeof fallback === "object" && p in fallback) {
              fallback = fallback[p];
            } else {
              // Not found in fallback either, return the key itself
              console.warn(`Translation key not found: ${key}`);
              return key;
            }
          }
          value = fallback;
          break;
        }
      }

      if (typeof value !== "string") {
        console.warn(`Translation key "${key}" does not resolve to a string`);
        return key;
      }

      // Handle interpolation: replace {{param}} with actual values
      if (params) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, paramName) => {
          if (paramName in params) {
            return String(params[paramName]);
          }
          console.warn(`Missing interpolation parameter: ${paramName} for key ${key}`);
          return `{{${paramName}}}`;
        });
      }

      return value;
    },
    [localeData]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      availableLocales: AVAILABLE_LOCALES,
      localeData,
    }),
    [locale, setLocale, t, localeData]
  );

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
}

/**
 * Hook to access i18n functionality
 * @returns The i18n context value with translation function and locale management
 * @throws Error if used outside of I18nProvider
 */
export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}

/**
 * Hook to get just the translation function (for components that only need translations)
 */
export function useT(): I18nContextValue["t"] {
  return useTranslation().t;
}

/**
 * Hook to get the current locale
 */
export function useLocale(): LocaleCode {
  return useTranslation().locale;
}

export { I18nContext };
export type { I18nContextValue };
